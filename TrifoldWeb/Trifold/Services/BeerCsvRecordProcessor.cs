using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;

namespace Trifold.Services
{
	public class BeerCsvRecordProcessor
	{
		private IBeerRepository _repository;
		private IUntappdApi _untappdApi;
		private ILogger<BeerCsvRecordProcessor> _logger;
		private readonly ISendGridService _email;

		public Beers AddBeer { get; set; }
		public BeerCsvRecords ProcessRecord { get; set; }

		public BeerCsvRecordProcessor(IBeerRepository repository, IUntappdApi untappdApi, ILogger<BeerCsvRecordProcessor> logger, ISendGridService email)
		{
			_repository = repository;
			_untappdApi = untappdApi;
			_logger = logger;
			_email = email;
		}

		public async Task<ProcessState> ProcessNextRecordAsync()
		{
			ProcessState state = ProcessState.NotProcessed;

			this.AddBeer = new Beers();
			this.AddBeer.Location = new Locations();
			this.AddBeer.Brewery = new Breweries();

			this.ProcessRecord = _repository.GetNextBeerCsvRecord();

			// An unprocessed record was found...
			if (ProcessRecord?.Id > 0)
			{
				// Set record state to 'processing'
				ProcessRecord.Processed = CsvRecordProcessingEnum.Processing;
				bool isProcessing = _repository.UpdateBeerCsvRecord(ProcessRecord);

				if (isProcessing == false)
				{
					_logger.LogWarning("Could not update CSV beer record");
					return ProcessState.Error;
				}

				// Check and set upload file state
				var file = _repository.GetCsvFileUpload(ProcessRecord.CsvUploadId);
				if(file.Progress == CsvFileProgress.Pending)
				{
					bool isInProgress = _repository.UpdateCsvUploadStatus(file.Id, CsvFileProgress.InProgress);
					if(isInProgress == false)
					{
						_logger.LogWarning("Could not update CSV file status");
					}
				}

                // Remove any "company" suffix from brewery name
                var brewerToLower = ProcessRecord.Brewery.ToLower();
                StripCompanySuffix(ref brewerToLower, "brewing company");
                StripCompanySuffix(ref brewerToLower, "beer company");
                StripCompanySuffix(ref brewerToLower, "company");
                StripCompanySuffix(ref brewerToLower, "co.");
                StripCompanySuffix(ref brewerToLower, "co");
                StripCompanySuffix(ref brewerToLower, "brewing");
                StripCompanySuffix(ref brewerToLower, "beer");
                StripCompanySuffix(ref brewerToLower, "brewery");

                // Search Untappd for beer
                string search = $"{brewerToLower} {ProcessRecord.Beer}";
				var result = await _untappdApi.SearchAsync(search, limit: 1);

				var eventId = ProcessRecord.CsvFileUploads.EventId;

				if (result?.response == null)
				{
					// No response from Untappd
					_logger.LogWarning("Error searching Untappd");

					// Reset record state
					ProcessRecord.Processed = CsvRecordProcessingEnum.NotProcessed;

					state = ProcessState.Error;
				}
				else
				{
					// Beer found in Untappd
					if (result.response.beers?.count > 0)
					{
						var beerResult = result.response.beers.items[0]?.beer;
						var breweryResult = result.response.beers.items[0]?.brewery;

						// Override ABV, IBU, Description with CSV values if present
						double abv = BeerCsvUpload.ProcessAbvEntry(ProcessRecord.ABV);
						AddBeer.Abv = abv == 0 ? Math.Round(beerResult.beer_abv, 1) : abv;

						int ibu = BeerCsvUpload.ProcessIbuEntry(ProcessRecord.IBU);
						AddBeer.Ibu = ibu == 0 ? beerResult.beer_ibu : ibu;

						AddBeer.Description = string.IsNullOrWhiteSpace(ProcessRecord.Description) ? beerResult.beer_description : ProcessRecord.Description.Trim();
                        //AddBeer.Style = string.IsNullOrWhiteSpace(ProcessRecord.Style) ? beerResult.beer_style : ProcessRecord.Style.Trim();
                        //AddBeer.BreweryCity = string.IsNullOrWhiteSpace(ProcessRecord.City) ? $"{breweryResult.location.brewery_city}, {breweryResult.location.brewery_state}" : ProcessRecord.City.Trim();

                        AddBeer.BeerName = beerResult.beer_name;
						AddBeer.Brewery.BreweryName = breweryResult.brewery_name;
						AddBeer.EventId = eventId;
						AddBeer.LabelUrl = beerResult.beer_label;
						AddBeer.UntappdBeerId = beerResult.bid;
                        AddBeer.Brewery.BreweryLogoUrl = breweryResult.brewery_label;
                        AddBeer.Style = beerResult.beer_style;
                        AddBeer.Brewery.BreweryCity = $"{breweryResult.location.brewery_city}, {breweryResult.location.brewery_state}";
						AddBeer.Location.TableNumber = ProcessRecord.Table;
						AddBeer.Brewery.UntappdBreweryId = breweryResult.brewery_id;

                        ProcessRecord.Processed = CsvRecordProcessingEnum.AddedUntappd;
                        ProcessRecord.UntappdBeer = beerResult.beer_name;
                        ProcessRecord.UntappdBrewery = breweryResult.brewery_name;

                        state = ProcessState.Success;
					}
					else
					{
						// Add beer from CSV file
						AddBeer = BeerCsvUpload.ProcessManualBeerEntry(ProcessRecord, eventId);

                        ProcessRecord.Processed = CsvRecordProcessingEnum.AddedNotFound;
                        ProcessRecord.Error = "No result in Untappd";

						state = ProcessState.SuccessManual;
					}

					// Add beer to beer list
					bool doesExist = _repository.DoesBeerExist(eventId, AddBeer);

					if (doesExist)
					{
						ProcessRecord.Processed = CsvRecordProcessingEnum.Error;
						ProcessRecord.Error = "Duplicate: Beer already exists in beer list";
					}
					else
					{
						bool isAdded = _repository.AddBeer(AddBeer);
						if (isAdded == false)
						{
							_logger.LogWarning("Could not save beer to database");
							ProcessRecord.Processed = CsvRecordProcessingEnum.Error;
							ProcessRecord.Error = "Error saving beer to beer list";
							state = ProcessState.Error;
						}
						else
						{
							_logger.LogInformation("New beer added: {beer} {brewery}. EventId: {eventId}", AddBeer.Brewery.BreweryName, AddBeer.BeerName, eventId);
						}
					}
				}

				// Update the record's Processed state
				bool isUpdated = _repository.UpdateBeerCsvRecord(ProcessRecord);
				if (isUpdated == false)
				{
					_logger.LogWarning("Could not update CSV beer record");
					state = ProcessState.Error;
				}

				// Check if file is finished processing
				var recordCount = _repository.GetCsvRecordCount(file.Id);
                var progress = _repository.GetCsvFileUpload(file.Id).Progress;
                if (recordCount.Completed == recordCount.Total && progress != CsvFileProgress.Canceled)
				{
					_repository.UpdateCsvUploadStatus(file.Id, CsvFileProgress.Completed);

					string email = _repository.GetEmailByEventId(eventId);
					if(email != null) await _email.SendCsvCompletionEmailAsync(email, eventId, file.Id);
				}
                else if(recordCount.Pending == 0 && recordCount.Processing > 0)
                {
                    // Something went wrong and records are stuck in processing
                    _logger.LogWarning("Records stuck in processing. Attempting to reset. File ID: {id}", file.Id);
                    _repository.ResetStuckBeerCsvRecords(file.Id);
                }
			}
			else
			{
				// No unprocessed records found
				state = ProcessState.SuccessNoRecords;
			}

			return state;
		}

        /// <summary>
        /// Strip the specified string from the end of the breweryName
        /// </summary>
        /// <param name="breweryName"></param>
        /// <param name="removeSuffix"></param>
        /// <returns></returns>
        protected void StripCompanySuffix(ref string breweryName, string removeSuffix)
        {
            if(breweryName.EndsWith(removeSuffix))
            {
                breweryName.Replace(removeSuffix, "");
            }
        }

		public enum ProcessState
		{
			NotProcessed,
			Success,
			Error,
			SuccessManual,
			SuccessNoRecords
		}

	}
}
