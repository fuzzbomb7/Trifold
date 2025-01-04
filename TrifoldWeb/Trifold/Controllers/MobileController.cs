using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Trifold.Data;
using Trifold.Models;
using Trifold.Models.Firestore;
using Trifold.Services;

namespace Trifold.Controllers
{
	public class MobileController : BaseEventController
    {
		private readonly IConfiguration configuration;
        private readonly IImageResize resize;
        private readonly IStorageService storage;
        private readonly IMobileRepository repository;
		private readonly IFirestoreService firestore;
        private readonly ISharedRepository shared;
        private readonly IQRService qrService;

        public MobileController(IMobileRepository repository, ISharedRepository shared, IAuthorizationService authorization, IFirestoreService firestore, IConfiguration configuration, 
            ILogger<MobileController> logger, UserManager<ApplicationUser> userManager, IImageResize resize, IStorageService storage, IQRService qRService)
			: base(authorization, logger, userManager, shared)
		{
			this.configuration = configuration;
            this.resize = resize;
            this.storage = storage;
            this.repository = repository;
            this.firestore = firestore;
            this.shared = shared;
            this.qrService = qRService;
		}

		/// <summary>
		/// Publish data to Firestore
		/// </summary>
		/// <param name="eventId"></param>
		/// <returns></returns>
		[Route("{eventId}/Mobile/Publish")]
		public IActionResult PublishMobile(int eventId)
		{
			DateTime? lastUpdated = repository.GetLastUpdated(eventId);
			return View(lastUpdated);
		}

		[HttpPost]
		[Route("{eventId}/Mobile/Publish")]
		public async Task<IActionResult> PublishMobile(int eventId, bool doesNothing = false)
		{
			var beers = repository.GetBeersWithLocations(eventId);
			var theEvent = shared.GetEvent(eventId);
            //int? appId = shared.GetApplicationId(theEvent.EventPromoterId);

			DateTime? lastUpdated = await firestore.WriteEventAndBeverageData(theEvent, beers);
            //bool isAppUpdated = await WriteFirestoreAppDataAsync(appId.Value);

            if (lastUpdated != null)// && isAppUpdated)
			{
				repository.SetLastUpdated(eventId, lastUpdated);

                repository.SetClean(eventId);
                HttpContext.Session.SetInt32("DirtyData", 0);
                ViewData["DirtyData"] = false;

                ViewBag.Confirmation = true;
			}
			else
			{
				ViewBag.Confirmation = false;
			}

			return View(lastUpdated);
		}

		[Route("Mobile/Config")]
		public IActionResult MobileConfig(int? eventId = null)
		{
			int? appId = HttpContext.Session.GetInt32("WhiteLabelId");
			ViewData["WhiteLabelId"] = appId;

			var model = new MobileConfigModel();
            if (eventId != null)
            {
                model.Event = shared.GetEvent(eventId.Value);
                model.Event.EventImageUrl = shared.GetCDNLink(model.Event.EventImageUrl);
            }
			return View(model);
		}

		/*[Route("{appId}/Mobile/AppLogoUpload")]
		[HttpPost]
        /// Splash screen upload
		public IActionResult AppLogoUpload(IFormFile file, int appId)
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

                string uploadPath = null;

				try
				{
                    using (var stream = new MemoryStream())
                    {
                        file.CopyTo(stream);
                        stream.Position = 0;
                        uploadPath = storage.UploadFile("app-splash", randomFileName, stream);
                    }
                }
				catch (Exception ex)
				{
					logger.LogError(ex, "Error saving image file to app-splash container. File name: {uploadPath}", uploadPath);
					return new StatusCodeResult(StatusCodes.Status500InternalServerError);
				}

                string existingImg = shared.GetAppConfiguration(appId)?.SplashImageUrl;
                if(existingImg != null)
                {
                    storage.DeleteFile(existingImg);
                }

				bool isImgAdded = repository.AddAppLogoFile(uploadPath, appId);
				if (isImgAdded == false) new StatusCodeResult(StatusCodes.Status500InternalServerError);
			}

			return Ok();
		}

        [Route("{appId}/Mobile/IconUpload")]
        [HttpPost]
        public IActionResult IconUpload(IFormFile file, int appId)
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

                string uploadPath = null;

                try
                {
                    using (var stream = new MemoryStream())
                    {
                        file.CopyTo(stream);
                        stream.Position = 0;

                        // Resize icon to 512px
                        resize.ResizeAndSave(stream, 512, 512);
                        stream.Position = 0;
                        uploadPath = storage.UploadFile("app-icon", randomFileName, stream);
                    }

                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error saving image file to app-icon container. File name: {uploadPath}", uploadPath);
                    return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                }

                string existingImg = shared.GetAppConfiguration(appId)?.AppIconUrl;
                if (existingImg != null)
                {
                    storage.DeleteFile(existingImg);
                }

                bool isImgAdded = repository.AddAppIconFile(uploadPath, appId);
                if (isImgAdded == false) new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }

            return Ok();
        }*/

        [Route("{eventId}/Mobile/EventLogoUpload")]
		[HttpPost]
		public IActionResult EventLogoUpload(IFormFile file, int eventId)
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

                string uploadPath = null;

                try
                {
                    using (var stream = new MemoryStream())
                    {
                        file.CopyTo(stream);
                        stream.Position = 0;

                        // Resize icon to 320px h
                        resize.ResizeAndSave(stream, 320, 0);
                        stream.Position = 0;
                        uploadPath = storage.UploadFile("event-logo", randomFileName, stream);
                    }

                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error saving image file to event-logo container. File name: {uploadPath}", uploadPath);
                    return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                }

                string existingImg = shared.GetEvent(eventId)?.EventImageUrl;
                if (existingImg != null)
                {
                    storage.DeleteFile(existingImg);
                }

                bool isImgAdded = repository.AddEventLogoFile(uploadPath, eventId);
				if (isImgAdded == false) return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }

			return Ok();
		}

		/*[Route("Mobile/SaveAppConfig")]
		[HttpPost]
		public IActionResult SaveAppConfig(int appId, string title, string color, string contrast, string secondaryColor)
		{
			bool result = repository.SaveAppConfig(appId, title, color, contrast, secondaryColor);
			return Json(result);
		}*/

		[Route("Mobile/SaveEventConfig")]
		[HttpPost]
		public async Task<IActionResult> SaveEventConfig(int eventId, string color, string contrast, string secondaryColor, bool addToProst)
		{
            bool result = repository.SaveEventConfig(eventId, color, contrast, secondaryColor, addToProst);

            var eventData = shared.GetEvent(eventId);
            await WriteFirestoreEventDataAsync(eventData);

            /*int? appId = shared.GetApplicationId(eventData.EventPromoterId);
            if (appId != null)
            {
                await WriteFirestoreAppDataAsync(appId.Value);
            }

            if (eventData?.AddToProst != addToProst || addToProst == true)
			{
                // Update Prost's app event data
                int? prostAppId = configuration.GetValue<int?>("ProstAppId");
                if (prostAppId != null)
                {
                    await WriteFirestoreAppDataAsync(prostAppId.Value);
                }
			}*/

			return Json(result);
		}

        /* Update app event data for specified application
		public async Task<bool> WriteFirestoreAppDataAsync(int appId)
        {
            string applicationId = shared.GetApplicationGuid(appId);
            var events = shared.GetApplicationEvents(appId);

            int? prostAppId = configuration.GetValue<int?>("ProstAppId");
            if (appId == prostAppId)
            {
                var prostEvents = shared.GetWhiteLabelProstEvents(prostAppId.Value);
                events.AddRange(prostEvents);
            }

            if (events.Count > 0)
            {
                return await firestore.WriteAppData(applicationId, events);
            }
            else return false;
        }*/

        public async Task<bool> WriteFirestoreEventDataAsync(Events data)
        {
            return await firestore.WriteEventData(data);
        }

        [Route("{eventId}/Mobile/Promo")]
		public IActionResult Promotion(int eventId)
		{
            var model = new PromotionModel();
            model.EventId = eventId;
            model.PromoUrl = repository.GetPromoUrl(eventId);
            model.QrUrl = qrService.GenerateQRCode($"https://trifold.app/{model.PromoUrl}", eventId);

           //var storeUrls = repository.GetAppUrls(eventId);
            //model.GooglePlayUrl = storeUrls.GooglePlayUrl;
           // model.AppStoreUrl = storeUrls.AppStoreUrl;

            return View(model);
		}

        [Route("{eventId}/Mobile/Promo")]
        [HttpPost]
        public IActionResult Promotion(PromotionModel model)
        {
            string url = repository.SetPromoUrl(model.EventId, model.PromoUrl);
            if (url == null)
            {
                ViewBag.UrlInUse = true;
            }
            else model.QrUrl = qrService.GenerateQRCode(model.PromoUrl, model.EventId);

            //repository.SetAppUrls(model.EventId, model.GooglePlayUrl, model.AppStoreUrl);
            return View(model);
        }

        /*[Route("Mobile/Build")]
		public IActionResult Build(int? eventId = null)
		{
			return View();
		}*/

        [Route("{eventId}/Mobile/Engagement")]
        public IActionResult Engagement(int eventId)
        {
            var data = repository.GetEngagementData(eventId);
            return View(data);
        }

        [Route("{eventId}/Mobile/Engagement")]
        [HttpPost]
        public IActionResult Engagement(Engagement data)
        {
            ViewBag.Error = null;

            if (!string.IsNullOrWhiteSpace(data.FacebookUrl) && !data.FacebookUrl.Contains("facebook.com")) ViewBag.Error = "The Facebook URL is invalid";
            if (!string.IsNullOrWhiteSpace(data.InstagramUrl) && !data.InstagramUrl.Contains("instagram.com")) ViewBag.Error = "The Instagram URL is invalid";
            if (!string.IsNullOrWhiteSpace(data.TwitterUrl) && !data.TwitterUrl.Contains("twitter.com")) ViewBag.Error = "The Twitter URL is invalid";
            if (!string.IsNullOrWhiteSpace(data.FBID) && string.IsNullOrWhiteSpace(data.FacebookUrl)) ViewBag.Error = "Please specify a Facebook URL when specifying an FBID";

            if (ViewBag.Error == null)
            {
                bool update = repository.SetEngagementData(data);
                if (update == false) ViewBag.Error = "Error setting engagement data. Please contact us if the problem persists.";
                else
                {
                    shared.SetDirty(HttpContext.Session, data.EventId);
                }
            }

            return View(data);
        }

        /*[Route("{eventId}/Mobile/Ticketing")]
        public IActionResult Ticketing(int eventId)
        {
            var data = repository.GetTicketingData(eventId);

            if(data == null)
            {
                data = new Ticketing();
                data.StartDate = DateTime.Today;
                data.EndDate = shared.GetEvent(eventId).EventStartTime;
                data.EventId = eventId;
                data.SoldOut = false;
            }

            return View(data);
        }

        [Route("{eventId}/Mobile/Ticketing")]
        [HttpPost]
        public IActionResult Ticketing(Ticketing data)
        {
            ViewBag.Error = null;

            if (data.StartDate >= data.EndDate) ViewBag.Error = "Start Date must be earlier than End Date";
            if (string.IsNullOrWhiteSpace(data.TicketUrl)) ViewBag.Error = "Ticket Sales URL must not be blank";

            if (ViewBag.Error == null)
            {
                bool success = repository.SetTicketingData(data);
                if(success)
                {
                    shared.SetDirty(HttpContext.Session, data.EventId);
                }
            }

            return View(data);
        }*/


    }
}