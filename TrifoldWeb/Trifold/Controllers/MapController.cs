using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Trifold.Data;
using Trifold.Models;
using System.Drawing;
using Microsoft.AspNetCore.Identity;
using Trifold.Services;

namespace Trifold.Controllers
{
	public class MapController : BaseEventController
	{
		private readonly IConfiguration _configuration;
        private readonly ISharedRepository shared;
        private readonly IMapRepository _repository;
        private readonly IStorageService storage;

        public MapController(IMapRepository repository, IAuthorizationService authorization, IConfiguration configuration, ISharedRepository shared, ILogger<MapController> logger, UserManager<ApplicationUser> userManager, IStorageService storage)
			: base(authorization, logger, userManager, shared)
		{
			_configuration = configuration;
            this.shared = shared;
            _repository = repository;
            this.storage = storage;
		}

		[Route("{eventId}/Map")]
		public IActionResult Index(int eventId)
		{
			var model = new MapViewModel();
			model.Map = shared.GetMap(eventId);
            if(model.Map != null) model.Map.MapPath = shared.GetCDNLink(model.Map.MapPath);
			return View(model);
		}

		[HttpPost]
		[Route("{eventId}/Map/[action]")]
		public IActionResult Upload(IFormFile file, int eventId)
		{
			if (file.Length > 0)
			{
				string[] validExtensions = { ".jpg", ".jpeg", ".png" };

				string extension = Path.GetExtension(file.FileName).ToLower();
				if (extension == null || validExtensions.Contains(extension) == false)
				{
					return new UnsupportedMediaTypeResult();
				}

				string randomFileName = Guid.NewGuid().ToString();
				randomFileName += extension;

				var map = new Maps();
				map.EventId = eventId;

                try
				{
					using (var stream = new MemoryStream())
					{
						file.CopyTo(stream);
                        stream.Position = 0;

                        Image image = Image.FromStream(stream);
                        map.Height = image.Height;
                        map.Width = image.Width;
                        stream.Position = 0;

                        map.MapPath = storage.UploadFile("event-map", randomFileName, stream);
                    }
				}
				catch (Exception ex)
				{
					logger.LogError(ex, "Error saving map file to event-map container. File name: {map.MapPath}", map.MapPath);
					return new StatusCodeResult(StatusCodes.Status500InternalServerError);
				}

                string existingImg = shared.GetMap(eventId)?.MapPath;
                if (existingImg != null)
                {
                    storage.DeleteFile(existingImg);
                }

                bool isMapAdded = _repository.AddMapFile(map);
				if(isMapAdded == false) new StatusCodeResult(StatusCodes.Status500InternalServerError);

                shared.SetDirty(HttpContext.Session, eventId);
            }

			return Ok();
		}

        [HttpPost]
        [Route("{eventId}/Map/[action]")]
        public IActionResult ClearMapData(int eventId)
        {
            bool clear = _repository.ClearMapData(eventId);
            return Json(clear);
        }

		[Route("{eventId}/Map/[action]")]
		public IActionResult GetMarkers(int eventId)
		{
			var locations = _repository.GetAssignedLocations(eventId);

			var markers = new List<PointOfInterestModel>();
			foreach (var loc in locations)
			{
				var poi = new PointOfInterestModel();
				poi.Id = loc.Id;
				poi.Latitude = loc.Latitude;
				poi.Longitude = loc.Longitude;
				poi.TableNumber = loc.TableNumber.Value;

				if (loc.AlternateName != null) poi.Location = loc.AlternateName;
				else poi.Location = $"Table {loc.TableNumber}";

				markers.Add(poi);
			}

			return Json(markers);
		}

		[Route("{eventId}/Map/[action]")]
		public IActionResult GetLocations(int eventId, string q)
		{
			List<Locations> locations;

			if (string.IsNullOrWhiteSpace(q)) locations = _repository.GetUnassignedLocations(eventId);
			else locations = _repository.SearchUnassignedLocations(eventId, q);

			// Select2 data format
			var selectData = new Select2DataModel();
			foreach(var loc in locations)
			{
				var sel = new Select2OptionModel();
				sel.Id = loc.Id.ToString();
				if (loc.AlternateName != null) sel.Text = loc.AlternateName;
				else sel.Text = $"Table {loc.TableNumber.Value.ToString("D2")}";

				selectData.Results.Add(sel);
			}

			selectData.Results = selectData.Results.OrderBy(x => x.Text).ToList();

			return Json(selectData);
		}

		[HttpPost]
		[Route("{eventId}/Map/[action]")]
		public IActionResult AddMarker(int eventId, int locationId, int x, int y)
		{
			bool added = _repository.AddMarker(eventId, locationId, x, y);
            if (added)
            {
                shared.SetDirty(HttpContext.Session, eventId);;
            }
            return Json(added);
		}

		[HttpPost]
		[Route("{eventId}/Map/[action]")]
		public IActionResult DeleteMarker(int eventId, int locationId)
		{
			bool deleted = _repository.DeleteMarker(eventId, locationId);
            if (deleted)
            {
                shared.SetDirty(HttpContext.Session, eventId);
            }
            return Json(deleted);
		}

		[HttpPost]
		[Route("{eventId}/Map/[action]")]
		public IActionResult EditMarker(int eventId, int locationId, int oldLocationId, int x, int y)
		{
			bool edited = _repository.EditMarker(eventId, oldLocationId, locationId, x, y);
            if (edited)
            {
                shared.SetDirty(HttpContext.Session, eventId);
            }
            return Json(edited);
		}

	}
}