using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Trifold.Data;
using Trifold.Services;
using Trifold.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IO;
using Microsoft.AspNetCore.Identity;

namespace Trifold.Controllers
{
	public class BeerController : BaseEventController
	{
		private IBeerRepository _repository;
        private readonly ISharedRepository shared;
        private IUntappdApi _untappdApi;

		public BeerController(IBeerRepository repository, ISharedRepository shared, IAuthorizationService authorization, ILogger<BeerController> logger, IUntappdApi untappdApi, UserManager<ApplicationUser> userManager) 
			: base(authorization, logger, userManager, shared)
		{
			_repository = repository;
            this.shared = shared;
            _untappdApi = untappdApi;
		}

		[Route("{eventId}/Beer/Add")]
		public IActionResult Add(int eventId)
        {
			ViewData["EventStartTime"] = _repository.GetPourStartTime(eventId);
			return View();
        }

		[Route("{eventId}/Beer/Import")]
		public IActionResult Import(int eventId)
		{
			var model = _repository.GetCsvFileUploads(eventId).OrderByDescending(x => x.UploadDate).ToList();

			// Get total and completed record count for in-progress files
			foreach(var file in model)
			{
				if(file.Progress == CsvFileProgress.InProgress)
				{
					file.Count = _repository.GetCsvRecordCount(file.Id);
				}
			}

			return View(model);
		}

		[Route("{eventId}/Beer/List")]
		public IActionResult List(int eventId)
		{
			ViewData["EventStartTime"] = _repository.GetPourStartTime(eventId);
			return View();
		}

		[Route("{eventId}/Beer/Get")]
		public IActionResult Get(int beerId, int eventId)
		{
			var beer = _repository.GetBeer(beerId, eventId);
			return Json(beer);
		}

		[Route("{eventId}/Beer/GetAll")]
		public IActionResult GetAll(int eventId)
		{
			var beers = _repository.GetBeers(eventId);
			return Json(beers);
		}

		[HttpPost]
		[Route("{eventId}/Beer/Edit")]
		public IActionResult Edit(Beers beer, int eventId)
		{
			bool updated = false;
			var updateBeer = _repository.GetBeer(beer.Id, eventId);

            int? currentLocation = updateBeer.Location?.TableNumber;
			int? newLocation = beer.Location.TableNumber;

			if(updateBeer.Id == beer.Id)
			{
				updateBeer.Abv = beer.Abv;
				updateBeer.BeerName = beer.BeerName;
				updateBeer.Brewery.BreweryCity = beer.Brewery.BreweryCity;
				updateBeer.Brewery.BreweryName = beer.Brewery.BreweryName;
				updateBeer.Description = beer.Description;
				updateBeer.Ibu = beer.Ibu;
				updateBeer.Style = beer.Style;
				updateBeer.UntappdBeerId = beer.UntappdBeerId;
				updateBeer.PourTime = beer.PourTime;

				if(beer.UntappdBeerId == 0)
				{
					updateBeer.LabelUrl = null;
				}

                // Set table number/name
                if (currentLocation != newLocation)
                {
                    int newLocId = _repository.AddGetLocation(updateBeer.EventId, newLocation.Value, beer.Location.AlternateName);
                    updateBeer.LocationId = newLocId;
                }

                updated = _repository.UpdateBeer(updateBeer);
			}

            if(updated)
            {
                // Delete location if brewery name changed and location not in use
                if (currentLocation != newLocation)
                {
                    int? locId = _repository.SearchLocation(updateBeer.EventId, newLocation.Value);
                    bool deleteLocation = _repository.CheckRemoveLocation(locId);
                    if(deleteLocation)
                    {
                        _repository.RemoveLocation(locId.Value);
                    }
                }

                shared.SetDirty(HttpContext.Session, eventId);
            }
			
			return Json(updated);
		}

		[HttpPost]
		[Route("{eventId}/Beer/Delete")]
		public IActionResult Delete(int beerId, int eventId)
		{
			bool deleted = _repository.DeleteBeer(beerId, eventId);
            if(deleted)
            {
                shared.SetDirty(HttpContext.Session, eventId);
            }
			return Json(deleted);
		}

		[Route("Beer/Api/Search")]
		public async Task<IActionResult> Search(string search, int offset = 0, int limit = 25)
		{
			BeerSearchResponseModel model = new BeerSearchResponseModel();

			// Return error if user has no access token and is not admin
			string accessToken = HttpContext.Session.GetString("AccessToken");
			if (string.IsNullOrWhiteSpace(accessToken) && !User.IsInRole("Admin"))
			{
				model.Error = "No access token for this user";
				return Json(model);
			}

			var json = await _untappdApi.SearchAsync(search, offset, limit, accessToken);

			if (!string.IsNullOrWhiteSpace(json.meta.error_detail))
			{
				model.Error = json.meta.developer_friendly ?? json.meta.error_detail;
			}
			else
			{
				if (json.response?.beers?.items?.Count > 0)
				{
					model.Beers = json.response.beers.items.Select(x => new Beers()
					{
						Brewery = new Models.Breweries()
						{
							BreweryName = x.brewery.brewery_name,
							BreweryCity = $"{x.brewery.location.brewery_city}, {x.brewery.location.brewery_state}",
							BreweryLogoUrl = x.brewery.brewery_label,
							UntappdBreweryId = x.brewery.brewery_id
						},
						Abv = Math.Round(x.beer.beer_abv, 1),
						BeerName = x.beer.beer_name,
						Description = x.beer.beer_description,
						Ibu = x.beer.beer_ibu,
						LabelUrl = x.beer.beer_label,
						Style = x.beer.beer_style,
						UntappdBeerId = x.beer.bid,
					}).ToList();
				}
			}

			return Json(model);
		}

		[HttpPost]
		[Route("{eventId}/Beer/Api/Add")]
		public IActionResult AddBeer(int eventId, Beers beer, bool checkDuplicate = true)
		{
			beer.EventId = eventId;
			bool isMatch = false;
			if(checkDuplicate) isMatch = _repository.DoesBeerExist(eventId, beer);

			bool add = false;
			if (isMatch == false)
			{
				if (beer.Location?.TableNumber != null)
				{
					int newLocId = _repository.AddGetLocation(eventId, beer.Location.TableNumber ?? 0, beer.Location.AlternateName);
					beer.LocationId = newLocId;
				}

				add = _repository.AddBeer(beer);
			}

			AddBeerResultEnum result = AddBeerResultEnum.Success;
			if (add == false) result = AddBeerResultEnum.Fail;
			if (isMatch == true) result = AddBeerResultEnum.Duplicate;

            if (result == AddBeerResultEnum.Success)
            {
                shared.SetDirty(HttpContext.Session, eventId);
            }

            return Json(result);
		}

		[Route("{eventId}/Beer/Brewery/Api/Search")]
		public IActionResult BreweryAutocomplete(string q)
		{
			var result = _repository.BreweryAutocomplete(q);
			return Json(result);
		}

		[Route("{eventId}/Beer/Style/Api/Search")]
		public IActionResult StyleAutocomplete(string q, int eventId)
		{
			var result = _repository.StyleAutocomplete(q, eventId);
			return Json(result);
		}

		[Route("{eventId}/Beer/City/Api/Search")]
		public IActionResult CityAutocomplete(string q, int eventId)
		{
			var result = _repository.CityAutocomplete(q, eventId);
			return Json(result);
		}

		[Route("{eventId}/Beer/Location/Api/Name")]
		public IActionResult GetLocationAlternateName(int eventId, int tableNumber)
		{
			var result = _repository.GetLocationAlternateName(eventId, tableNumber);
			return Json(result);
		}

		[HttpPost]
		[Route("{eventId}/Beer/Upload")]
		public IActionResult Upload(IFormFile file, int eventId)
		{
			if (file.Length > 0)
			{
				var stream = file.OpenReadStream();
				var records = new List<BeerCsvRecords>();

				// Read file
				using (var streamReader = new StreamReader(stream))
				{
                    try
                    {
                        records = BeerCsvUpload.ReadFromFile(streamReader);
                    }
                    catch (Exception)
                    {
                        return StatusCode(StatusCodes.Status500InternalServerError);
                    }
				}

                // Save file upload record
                int fileId = _repository.AddCsvUpload(file.FileName, eventId);
                if (fileId <= 0) return StatusCode(StatusCodes.Status500InternalServerError);

                bool isPreProcess = false;
				if (records.Count > 0)
				{
					// Preprocess and save records
					BeerCsvUpload.PreProcessFile(ref records, fileId, eventId);
					isPreProcess = _repository.AddBeerCsvRecords(records);

                    shared.SetDirty(HttpContext.Session, eventId);
                }

				if(isPreProcess)
				{
					// TODO: Put this in a job?
					// Manually add beers marked as SKIP to beer list
					var manualAdd = records.Where(x => x.UntappdId == "SKIP").ToList();
					foreach(var manual in manualAdd)
					{
						var addBeer = BeerCsvUpload.ProcessManualBeerEntry(manual, eventId);
						bool isAdded = _repository.AddBeer(addBeer);
						if(isAdded)
						{
							bool isUpdated = _repository.UpdateBeerCsvRecord(manual);
						}
					}
				}
				else
				{
					bool status = _repository.UpdateCsvUploadStatus(fileId, CsvFileProgress.Error);
					if (!status) return StatusCode(StatusCodes.Status500InternalServerError);
				}
            }

			return Ok();
		}


		[Route("{eventId}/Beer/ImportLog/{csvUploadId}")]
		public IActionResult ImportLog(int csvUploadId, int eventId)
		{
			var records = _repository.GetBeerCsvRecords(csvUploadId);
			return View(records);
		}

        [Route("{eventId}/Beer/CancelFileProcessing")]
        public IActionResult CancelFileProcessing(int csvUploadId)
        {
            bool canceled = _repository.UpdateCsvUploadStatus(csvUploadId, CsvFileProgress.Canceled);
            bool removed = _repository.RemoveBeerCsvRecords(csvUploadId);

            return Json((canceled && removed));
        }

		[Route("{eventId}/Beer/Breweries/Api/GetAll")]
		public IActionResult GetBreweries(int eventId)
		{
			var breweries = _repository.GetBreweries(eventId);

			foreach(var brewery in breweries)
			{
				string tableNumbers = "";
				for(int i = 0; i < brewery.Locations.Count(); i++)
				{
					tableNumbers += brewery.Locations[i].TableNumber;

					if(!string.IsNullOrWhiteSpace(brewery.Locations[i].AlternateName))
					{
						tableNumbers += $" ({brewery.Locations[i].AlternateName})";
					}

					if(i < brewery.Locations.Count() - 1)
					{
						tableNumbers += ", ";
					}

					brewery.TableNumbers = tableNumbers;
				}
			}
			return Json(breweries);
		}

		[Route("{eventId}/Beer/Breweries/Api/GetSelectList")]
		public IActionResult GetBrewerySelectList(int eventId, string q = null, int? exclude = null)
		{
			var breweries = _repository.GetBreweries(eventId);

			if (q != null) breweries = breweries.Where(x => x.BreweryName.ToLower().StartsWith(q.ToLower())).ToList();
			if (exclude != null)
			{
				var removeBrewery = breweries.Where(x => x.BreweryId == exclude).FirstOrDefault();
				if(removeBrewery != null) breweries.Remove(removeBrewery);
			}

			// Select2 data format
			var selectData = new Select2DataModel();
			selectData.Results = breweries.Select(x => new Select2OptionModel { Id = x.BreweryId.ToString(), Text = x.BreweryName }).OrderBy(x => x.Text).ToList();
			
			return Json(selectData);
		}

		[Route("{eventId}/Beer/Breweries")]
		#pragma warning disable IDE0060 // Remove unused parameter
		public IActionResult Breweries(int eventId)
		{
			return View();
		}

		[Route("{eventId}/Beer/Breweries/Api/GetTable")]
		public IActionResult GetBreweryTable(int eventId, int breweryId)
		{
			var table = _repository.GetBreweryLocation(eventId, breweryId);
			if (table == null) table = new Locations();
			return Json(table);
		}

		[HttpPost]
		[Route("{eventId}/Beer/Breweries/Api/SetTable")]
		public IActionResult SetBreweryTable(int eventId, int breweryId, int tableNumber, string tableName = null)
		{
			var tableId = _repository.AddGetLocation(eventId, tableNumber, tableName);
			bool success = _repository.SetBreweryLocation(eventId, breweryId, tableId);

			return Json(success);
		}

		[HttpPost]
		[Route("{eventId}/Beer/Breweries/Api/Merge")]
		public IActionResult MergeBreweries(int eventId, int oldBreweryId, int newBreweryId)
		{
			var beers = _repository.GetBeers(eventId, oldBreweryId);
			var table = _repository.GetBreweryLocation(eventId, newBreweryId);
			bool success = _repository.MergeBrewery(beers, newBreweryId, table?.Id);

			var checkBrewery = _repository.GetBrewery(oldBreweryId);
			if(checkBrewery.Beers.Count == 0) _repository.RemoveBrewery(checkBrewery);

			return Json(success);
		}

		[Route("{eventId}/Beer/Replace/{beerId}")]
		public IActionResult Replace(int eventId, int beerId)
		{
			var beer = _repository.GetBeer(beerId, eventId);
			return View(beer);
		}

	}
}