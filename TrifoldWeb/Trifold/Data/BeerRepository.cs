using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Controllers;
using Trifold.Models;
using Dapper;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;
using Trifold.Services;

namespace Trifold.Data
{
	public class BeerRepository : IBeerRepository
	{
		public ApplicationDbContext Context { get; private set; }
		private ILogger logger;
		private readonly IConfiguration configuration;
		private readonly IFirestoreService firestore;

		public BeerRepository(ApplicationDbContext context, ILogger<BeerRepository> logger, IConfiguration configuration, IFirestoreService firestore)
		{
			Context = context;
			this.logger = logger;
			this.configuration = configuration;
			this.firestore = firestore;
		}

		public List<Beers> GetBeers(int eventId)
		{
			try
			{
				return Context.Beers.Where(x => x.EventId == eventId).Include(x => x.Location).Include(x => x.Brewery).ToList();
			}
			catch(Exception ex)
			{
				logger.LogError(ex, "Error getting beer list. EventId: {eventId}", eventId);
				return new List<Beers>();
			}
		}

		public Beers GetBeer(int beerId, int eventId)
		{
			try
			{
				return Context.Beers.Where(x => x.Id == beerId && x.EventId == eventId).Include(x => x.Location).Include(x => x.Brewery).FirstOrDefault();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error getting beer. Id: {beerId}, EventId: {eventId}", beerId, eventId);
				return new Beers();
			}
		}

		public bool AddBeer(Beers beer)
		{
			try
			{
				if (beer.Location?.TableNumber != null)
				{
					int locationId = AddGetLocation(beer.EventId, beer.Location.TableNumber.Value, beer.Location.AlternateName);
					beer.LocationId = locationId;
				}
				else beer.Location = null;

				beer.BreweryId = AddGetBrewery(beer.Brewery);

				Context.Beers.Add(beer);
				Context.SaveChanges();

				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error inserting record in Beers. {beer}", beer);
				return false;
			}		
		}

		public int? AddGetBrewery(Breweries brewery)
		{
            try
            {
                var existingBrewery = Context.Breweries.Where(x => x.BreweryCity == brewery.BreweryCity
					&& x.BreweryLogoUrl == brewery.BreweryLogoUrl
					&& x.BreweryName == brewery.BreweryName
					&& x.UntappdBreweryId == brewery.UntappdBreweryId)
                .FirstOrDefault();

                if (existingBrewery != null) return existingBrewery.Id;
                else
                {
                    Context.Breweries.Add(brewery);
                    Context.SaveChanges();
                    return brewery.Id;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error inserting record in Breweries");
                return null;
            }
        }

		public int AddGetLocation(int eventId, int tableNumber, string alternateName)
		{
			try
			{
				var existingLocation = Context.Locations.Where(x => x.TableNumber == tableNumber && x.EventId == eventId).FirstOrDefault();

				// Add new
				if(existingLocation == null)
				{
					var addLocation = new Locations() { AlternateName = alternateName, TableNumber = tableNumber, EventId = eventId };
					Context.Locations.Add(addLocation);
					Context.SaveChanges();

					return addLocation.Id;
				}
				// Update alternate name
				else if(alternateName != existingLocation.AlternateName)
				{
					existingLocation.AlternateName = alternateName;
					Context.SaveChanges();
				}

				return existingLocation.Id;
			}
			catch(Exception ex)
			{
				logger.LogError(ex, "Error inserting record in Locations");
				return 0;
			}
		}

		public bool DeleteBeer(int beerId, int eventId)
		{
			try
			{
				var beer = GetBeer(beerId, eventId);
				if(beer.Id != 0) Context.Beers.Remove(beer);

                bool deleteLocation = CheckRemoveLocation(beer.LocationId);
                if(deleteLocation)
                {
                    RemoveLocation(beer.LocationId.Value);
                }

				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error deleting record in Beers. BeerId: {beerId}, EventId: {eventId}", beerId, eventId);
				return false;
			}
		}

        public bool RemoveLocation(int locationId)
        {
            try
            {
                var location = Context.Locations.Find(locationId);
                Context.Locations.Remove(location);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error deleting location. LocationId: {locationId}", locationId);
                return false;
            }
        }

        public bool CheckRemoveLocation(int? locationId)
        {
            try
            {
                if (locationId == null) return false;

                int? confirmLocation = Context.Locations.Find(locationId)?.Id;
                int beersInLocationCount = Context.Beers.Where(x => x.LocationId == locationId).Count();

                if (beersInLocationCount <= 0 && locationId == confirmLocation) return true;
                else return false;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error checking record in Locations. LocationId: {location}", locationId);
                return false;
            }
        }

        public bool UpdateBeer(Beers beer)
		{
			try
			{
				Context.Beers.Update(beer);
				Context.SaveChanges();

				return true;

			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error updating record in Beers. {beer}", JsonConvert.SerializeObject(beer));
				return false;
			}
		}

		public bool DoesBeerExist(int eventId, Beers beer)
		{
			try
			{
				return Context.Beers.Include(x => x.Brewery).Where(x =>
					(x.BeerName.Trim().ToLower() == beer.BeerName.Trim().ToLower() && x.Brewery.BreweryName == beer.Brewery.BreweryName && x.EventId == eventId) ||
					(x.UntappdBeerId == beer.UntappdBeerId && x.UntappdBeerId != 0 && x.EventId == eventId))
					.Any();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error querying for existing beer. EventId: {eventId}, {beer}", eventId, beer);
				return false;
			}
		}

		public List<string> BreweryAutocomplete(string term)
		{
			try
			{
				using (var db = new SqlConnection(configuration.GetConnectionString("DefaultConnection")))
				{
					db.Open();
					return db.Query<string>(@"SELECT DISTINCT BreweryName FROM Breweries 
						WHERE BreweryName LIKE @term ORDER BY BreweryName",
						new { term = term + "%" }).ToList();
				}
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error in brewery autocomplete. Search term: {term}", term);
				return new List<string>();
			}
		}

		public List<string> StyleAutocomplete(string term, int eventId)
		{
			try
			{
				using (var db = new SqlConnection(configuration.GetConnectionString("DefaultConnection")))
				{
					db.Open();
					return db.Query<string>(@"SELECT DISTINCT Style FROM Beers 
					WHERE Style LIKE @term AND EventId = @eventId ORDER BY Style",
						new { term = "%" + term + "%", eventId }).ToList();
				}
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error in style autocomplete. Search term: {term}, EventId: {eventId}", term, eventId);
				return new List<string>();
			}
		}

		public List<string> CityAutocomplete(string term, int eventId)
		{
			try
			{
				using (var db = new SqlConnection(configuration.GetConnectionString("DefaultConnection")))
				{
					db.Open();
					return db.Query<string>(@"SELECT DISTINCT BreweryCity FROM Breweries 
					WHERE BreweryCity LIKE @term AND EventId = @eventId ORDER BY BreweryCity",
						new { term = "%" + term + "%", eventId }).ToList();
				}
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error in city autocomplete. Search term: {term}, EventId: {eventId}", term, eventId);
				return new List<string>();
			}
		}

		public int AddCsvUpload(string fileName, int eventId)
		{
			try
			{
				var csv = new CsvFileUploads();
				csv.EventId = eventId;
				csv.FileName = fileName;
				csv.Progress = CsvFileProgress.Pending;
				csv.UploadDate = DateTime.Now;

				Context.CsvFileUploads.Add(csv);
				Context.SaveChanges();
				return csv.Id;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error adding new CSV upload. Filename: {fileName}, EventId: {eventId}", fileName, eventId);
				return -1;
			}
		}

		public bool UpdateCsvUploadStatus(int csvUploadId, CsvFileProgress newProgress)
		{
			try
			{
				var file = Context.CsvFileUploads.Find(csvUploadId);
				file.Progress = newProgress;
				Context.CsvFileUploads.Update(file);
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error updating CSV file upload status. Id: {csvUploadId}, Progress: {newProgress}", csvUploadId, newProgress);
				return false;
			}
		}

		public bool AddBeerCsvRecords(IEnumerable<BeerCsvRecords> records)
		{
			try
			{
				Context.BeerCsvRecords.AddRange(records);
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error adding CSV beer records. Contents: {records}", JsonConvert.SerializeObject(records, Formatting.None, new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.Objects }));
				return false;
			}

		}

		public List<BeerCsvRecords> GetBeerCsvRecords(int csvUploadId)
		{
			try
			{
				return Context.BeerCsvRecords.Where(x => x.CsvUploadId == csvUploadId).ToList();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error retrieving CSV beer records. CSV Upload Id: {csvUploadId}", csvUploadId);
				return new List<BeerCsvRecords>();
			}
		}

		public BeerCsvRecords GetNextBeerCsvRecord()
		{
			try
			{
				return Context.BeerCsvRecords.Where(x => x.Processed == CsvRecordProcessingEnum.NotProcessed).Include(x => x.CsvFileUploads).OrderBy(x => x.Id).Take(1).FirstOrDefault();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error retrieving CSV beer record");
				return new BeerCsvRecords();
			}
		}

		public bool UpdateBeerCsvRecords(List<BeerCsvRecords> records)
		{
			try
			{
				Context.BeerCsvRecords.UpdateRange(records);
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error updating CSV beer records. Contents: {records}", JsonConvert.SerializeObject(records, Formatting.None, new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.Objects }));
				return false;
			}
		}

		public bool UpdateBeerCsvRecord(BeerCsvRecords record)
		{
			try
			{
				Context.BeerCsvRecords.Update(record);
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error updating CSV beer record. Contents: {record}", JsonConvert.SerializeObject(record, Formatting.None, new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.Objects }));
				return false;
			}
		}

		public List<CsvFileUploads> GetCsvFileUploads(int eventId)
		{
			try
			{
				return Context.CsvFileUploads.Where(x => x.EventId == eventId).ToList();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error retrieving CSV file uploads. EventId: {eventId}", eventId);
				return new List<CsvFileUploads>();
			}
		}

		public CsvFileUploads GetCsvFileUpload(int id)
		{
			try
			{
				return Context.CsvFileUploads.Find(id);
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error retrieving CSV file upload. Id: {id}", id);
				return new CsvFileUploads();
			}
		}

		public CsvRecordCount GetCsvRecordCount(int csvUploadId)
		{
			try
			{
				var count = new CsvRecordCount();
				var records = Context.BeerCsvRecords.Where(x => x.CsvUploadId == csvUploadId);
				count.Completed = records.Where(x => x.Processed != CsvRecordProcessingEnum.NotProcessed && x.Processed != CsvRecordProcessingEnum.Processing).Count();
                count.Pending = records.Where(x => x.Processed == CsvRecordProcessingEnum.NotProcessed).Count();
                count.Processing = records.Where(x => x.Processed == CsvRecordProcessingEnum.Processing).Count();
                count.Total = records.Count();
				return count;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error getting CSV record count. CSVUploadId: {csvUploadId}", csvUploadId);
				return new CsvRecordCount();
			}
		}

		public string GetEmailByEventId(int eventId)
		{
			try
			{
				using (var db = new SqlConnection(configuration.GetConnectionString("DefaultConnection")))
				{
					db.Open();
					return db.ExecuteScalar<string>(@"SELECT Email FROM AspNetUsers
						JOIN EventPromoters ON AspNetUsers.EventPromoterId = EventPromoters.Id
						JOIN Events ON EventPromoters.Id = Events.EventPromoterId
						WHERE Events.Id = @eventId",
						new { eventId });
				}
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error getting email by event ID: {eventId}", eventId);
				return null;
			}
		}

        public bool ResetStuckBeerCsvRecords(int csvUploadId)
        {
            try
            {
                var processing = Context.BeerCsvRecords.Where(x => x.Processed == CsvRecordProcessingEnum.Processing).ToList();
                processing.ForEach(x => { x.Processed = CsvRecordProcessingEnum.NotProcessed; });
                Context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error resetting stuck records. File ID: {csvUploadId}", csvUploadId);
                return false;
            }
        }

        public bool RemoveBeerCsvRecords(int csvUploadId)
        {
            try
            {
                var remove = Context.BeerCsvRecords.Where(x => x.Processed == CsvRecordProcessingEnum.NotProcessed).ToList();
                Context.BeerCsvRecords.RemoveRange(remove);
                Context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error removing unprocessed beer CSV records. File ID: {csvUploadId}", csvUploadId);
                return false;
            }
        }

        public int? SearchLocation(int eventId, int tableNumber)
        {
            return Context.Locations.Where(x => x.EventId == eventId && x.TableNumber == tableNumber).FirstOrDefault()?.Id;
        }

		public string GetLocationAlternateName(int eventId, int tableNumber)
		{
			return Context.Locations.Where(x => x.EventId == eventId && x.TableNumber == tableNumber).FirstOrDefault()?.AlternateName;
		}

		public List<BreweryModel> GetBreweries(int eventId)
		{
			return Context.Beers.Where(x => x.EventId == eventId)
				.Include(x => x.Location)
				.Include(x => x.Brewery)
				.GroupBy(x => x.Brewery)
				.Select(x => new BreweryModel()
				{
					BreweryId = x.Key.Id,
					BreweryCity = x.Key.BreweryCity,
					BreweryName = x.Key.BreweryName,
					BreweryLogoUrl = x.Key.BreweryLogoUrl,
					NumberOfBeers = x.Count(),
					Locations = x.Where(y => y.Location != null).Select(y => y.Location).Distinct().OrderBy(z => z.TableNumber).ToList()
				})
				.ToList();
		}

		public List<Beers> GetBeers(int eventId, int breweryId)
		{
			return Context.Beers.Where(x => x.EventId == eventId && x.BreweryId == breweryId).ToList();
		}

		public bool MergeBrewery(List<Beers> beers, int newBreweryId, int? locationId)
		{
            try
            {
				foreach(var beer in beers)
                {
                    beer.BreweryId = newBreweryId;
					beer.LocationId = locationId;
                }

				Context.Beers.UpdateRange(beers);
				Context.SaveChanges();
				return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error changing brewery. New Brewery Id: {newBreweryId}", newBreweryId);
                return false;
            }
        }

		public bool UpdateBrewery(Breweries brewery)
		{
			try
			{
				Context.Breweries.Update(brewery);
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error updating brewery.");
				return false;
			}
		}

		public Locations GetBreweryLocation(int eventId, int breweryId)
		{
			return Context.Beers.Where(x => x.BreweryId == breweryId && x.EventId == eventId).Include(x => x.Location).FirstOrDefault().Location;
		}

		public bool SetBreweryLocation(int eventId, int breweryId, int locationId)
		{
			try
			{
				var beers = Context.Beers.Where(x => x.BreweryId == breweryId && x.EventId == eventId).ToList();

				foreach(var beer in beers)
				{
					beer.LocationId = locationId;
				}

				Context.Beers.UpdateRange(beers);
				Context.SaveChanges();

				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error setting brewery location. EventId: {eventId}, BreweryId: {breweryId}, LocationId: {locationId}", eventId, breweryId, locationId);
				return false;
			}

		}

		public bool RemoveBrewery(int breweryId)
		{
			try
			{
				var deadBrewery = Context.Breweries.Find(breweryId);
				Context.Breweries.Remove(deadBrewery);
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error deleting brewery. BreweryId: {breweryId}", breweryId);
				return false;
			}
		}

		public bool RemoveBrewery(Breweries brewery)
		{
			try
			{
				Context.Breweries.Remove(brewery);
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error deleting brewery. BreweryId: {brewery}", brewery.Id);
				return false;
			}
		}

		public Breweries GetBrewery(int breweryId)
		{
			return Context.Breweries.Include(x => x.Beers).Where(x => x.Id == breweryId).FirstOrDefault();
		}

		public DateTime GetPourStartTime(int eventId)
		{
			return Context.Events.Find(eventId).EventStartTime;
		}
	}
}
