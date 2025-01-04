using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;
using Trifold.Services;

namespace Trifold.Controllers
{
	[Authorize(Roles = "Admin")]
	public class AdminController : Controller
	{
		private IAdminRepository _context;
		private UserManager<ApplicationUser> _userManager;
		private ILogger _logger;
		private readonly ISendGridService _email;
		private readonly IFirestoreService firestore;
        private readonly IConfiguration configuration;
        private readonly IFoursquareApi foursquare;
        private readonly IStorageService storage;
        private readonly ISharedRepository shared;

        public AdminController(IAdminRepository context, ISharedRepository shared, UserManager<ApplicationUser> userManager, ILogger<AdminController> logger, ISendGridService email, 
            IFirestoreService firestore, IConfiguration configuration, IFoursquareApi foursquare, IStorageService storage)
		{
			_context = context;
			_userManager = userManager;
			_logger = logger;
			_email = email;
			this.firestore = firestore;
            this.configuration = configuration;
            this.foursquare = foursquare;
            this.storage = storage;
            this.shared = shared;
        }

		public override void OnActionExecuted(ActionExecutedContext context)
		{
			base.OnActionExecuted(context);

            // Get user information for navbar menu display
            string userName = "Admin User";
            context.HttpContext.Session.SetString("Company", userName);
            ViewData["Company"] = userName;  
		}

		public IActionResult Index()
		{
			var events = _context.GetUpcomingEvents();
			return View(events);
		}

		public IActionResult Promoters()
		{
			var promoters = _context.GetEventPromoters();
			return View(promoters);
		}

		[Route("Admin/Promoters/Add")]
		public IActionResult PromotersAdd()
		{
			//ViewBag.Apps = _context.GetAppSelectList();
			ViewData["Title"] = "Add Promoter";
			return View("PromotersAddEdit");
		}

		[Route("Admin/Promoters/Add")]
		[HttpPost]
		public IActionResult PromotersAdd(EventPromoters promoter)
		{
			_context.AddEventPromoter(promoter);
			return RedirectToAction("Promoters");
		}

		[Route("Admin/Promoters/Edit/{id}")]
		public IActionResult PromotersEdit(int id)
		{
			var promoter = shared.GetEventPromoter(id);
			ViewData["Title"] = "Edit Promoter";
			//ViewBag.Apps = _context.GetAppSelectList();
			return View("PromotersAddEdit", promoter);
		}

		[Route("Admin/Promoters/Edit/{id}")]
		[HttpPost]
		public async Task<IActionResult> PromotersEdit(EventPromoters promoter, int oldAppId)
		{
			_context.UpdateEventPromoter(promoter);

			//if (promoter.AppId != null && oldAppId != promoter.AppId)
			//{
   //             await UpdateFirestoreAppDataAsync(oldAppId);
   //             await UpdateFirestoreAppDataAsync(promoter.AppId.Value);
			//}

			return RedirectToAction("Promoters");
		}

		[Route("Admin/Events")]
		public IActionResult Events(int? pId = null)
		{
            var events = new List<Events>();
            if(pId.HasValue)
            {
                events = _context.GetEvents(pId.Value);
                ViewBag.FilterByPromoter = true;
            }
            else events = _context.GetEvents();
			return View(events);
		}

		[Route("Admin/Events/Add")]
		public IActionResult EventsAdd()
		{
			ViewBag.Promoters = _context.GetEventPromoterSelectList();
			ViewData["Title"] = "Add Event";
			return View("EventsAddEdit", new Events());
		}

        [Route("Admin/Events/Add")]
        [HttpPost]
        public IActionResult EventsAdd(Events addevent)
        {
            // Set selected modules
            addevent.Modules.Clear();
            foreach (var module in addevent.SelectedModules)
            {
                addevent.Modules.Add(new Modules { EventId = addevent.Id, ModuleId = (ModuleEnum)module });
            }

            //addevent.AddToProst = true;
            _context.AddEvent(addevent);

            /* Update app data
			var promoter = _context.GetEventPromoter(addevent.EventPromoterId);
			if (promoter.AppId != null)
			{
				await UpdateFirestoreAppDataAsync(promoter.AppId.Value);
			}

            // Update app data for Prost! (All event added automatically)
            int? prostAppId = configuration.GetValue<int?>("ProstAppId");
            if(prostAppId != null)
            {
                await UpdateFirestoreAppDataAsync(prostAppId.Value);
            } */

            return RedirectToAction("Events");
        }

        [Route("Admin/Events/Edit/{id}")]
		public IActionResult EventsEdit(int id)
		{
			var editEvent = shared.GetEvent(id);
			ViewBag.Promoters = _context.GetEventPromoterSelectList();
			ViewData["Title"] = "Edit Event";
			return View("EventsAddEdit", editEvent);
		}

		[Route("Admin/Events/Edit/{id}")]
		[HttpPost]
		public async Task<IActionResult> EventsEdit(Events editEvent)
		{
			// Set selected modules
			editEvent.Modules.Clear();
			foreach (var module in editEvent.SelectedModules)
			{
				editEvent.Modules.Add(new Modules { EventId = editEvent.Id, ModuleId = (ModuleEnum)module });
			}

			_context.UpdateEvent(editEvent);

            //// Only update app event data if it's apparent that user has fully updated their event configuration
            //if(editEvent.EventImageUrl != null && editEvent.EventPrimaryColor != null)
            //{
            //    // Update app data
            //    var promoter = shared.GetEventPromoter(editEvent.EventPromoterId);
            //    if (promoter.AppId != null)
            //    {
            //        await UpdateFirestoreAppDataAsync(promoter.AppId.Value);
            //    }

            //    // Update app data for Prost!
            //    if (editEvent.AddToProst == true)
            //    {
            //        int? prostAppId = configuration.GetValue<int?>("ProstAppId");
            //        if (prostAppId != null)
            //        {
            //            await UpdateFirestoreAppDataAsync(prostAppId.Value);
            //        }
            //    }
            //}

            return RedirectToAction("Events");
		}

		public IActionResult Users()
		{
			var users = _userManager.Users.Include(x => x.EventPromoter).ToList();
			return View(users);
		}

		[Route("Admin/Users/Remove/{id}")]
		public async Task<IActionResult> RemoveUser(string id)
		{
			var user = await _userManager.FindByIdAsync(id);
			if (user != null)
			{
				await _userManager.DeleteAsync(user);
			}
			return RedirectToAction("Users");
		}

		[Route("Admin/Users/Add")]
		public IActionResult UsersAdd()
		{
			ViewBag.Promoters = _context.GetEventPromoterSelectList();
			return View();
		}

		[Route("Admin/Users/Add")]
		[HttpPost]
		public async Task<IActionResult> UsersAdd(NewUser newUser)
		{
			var user = new ApplicationUser() { UserName = newUser.UserName, Email = newUser.UserName, EventPromoterId = newUser.EventPromoterId == 0 ? null : newUser.EventPromoterId };
			var result = await _userManager.CreateAsync(user, newUser.Password);

			if (!result.Succeeded)
			{
				foreach (var error in result.Errors)
				{
					ModelState.AddModelError(error.Code, error.Description);
				}

				ViewBag.Promoters = _context.GetEventPromoterSelectList();
				return View(newUser);
			}

			if (user.EventPromoterId == null) _userManager.AddToRoleAsync(user, "Admin").Wait();
			else _userManager.AddToRoleAsync(user, "User").Wait();

			await _email.SendNewUserEmailAsync(newUser.UserName, newUser.Password);
			await _email.AddToEmailListAsync(newUser.UserName);

			return RedirectToAction("Users");
		}

		//[Route("Admin/Apps")]
		//public IActionResult Apps()
		//{
		//	var apps = _context.GetApps();
		//	return View(apps);
		//}

		//[Route("Admin/Apps/Add")]
		//public IActionResult AppsAdd()
		//{
		//	return View();
		//}

		//[Route("Admin/Apps/Add")]
		//[HttpPost]
		//public IActionResult AppsAdd(Apps app)
		//{
		//	app.ApplicationId = System.Guid.NewGuid().ToString();
		//	app.IsWhiteLabel = true;
		//	_context.AddApp(app);
		//	return RedirectToAction("Apps");
		//}

		//[Route("Admin/Apps/Edit/{id}")]
		//public IActionResult AppsEdit(int id)
		//{
		//	var app = _context.GetApp(id);
		//	return View(app);
		//}

		//[Route("Admin/Apps/Edit/{id}")]
		//[HttpPost]
		//public IActionResult AppsEdit(Apps app)
		//{
		//	_context.UpdateApp(app);
		//	return RedirectToAction("Apps");
		//}

  //      [Route("Admin/Apps/Config/{id}")]
  //      public IActionResult AppsConfig(int id)
  //      {
  //          var app = _context.GetApp(id);
  //          return View(app);
  //      }

  //      [Route("Admin/Apps/ConfigDownload/{id}")]
  //      public IActionResult AppsConfigDownload(int id)
  //      {
  //          var app = _context.GetApp(id);

  //          string assetPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\assetdownload\\assets");

  //          // Create config file
  //          var config = new AppConfigFileModel();
  //          config.AppGuid = app.ApplicationId;
  //          config.PrimaryColor = app.PrimaryColor;
  //          config.PrimaryColorBrightness = app.TextContrast;
  //          config.SecondaryColor = app.SecondaryColor;
  //          string configJson = JsonConvert.SerializeObject(config);

  //          string configPath = Path.Combine(assetPath, "appconfig.json");
  //          System.IO.File.WriteAllText(configPath, configJson);

  //          // Copy logo and icon files
  //          if (app.SplashImageUrl != null)
  //          {
  //              var downloadSplashFile = storage.DownloadFile(app.SplashImageUrl);

  //              using(var localFile = new FileStream(Path.Combine(assetPath, "splash.png"), FileMode.Create))
  //              {
  //                  downloadSplashFile.WriteTo(localFile);
  //              }
  //          }

  //          if (app.AppIconUrl != null)
  //          {
  //              var downloadIconFile = storage.DownloadFile(app.AppIconUrl);

  //              using (var localFile = new FileStream(Path.Combine(assetPath, "icon.png"), FileMode.Create))
  //              {
  //                  downloadIconFile.WriteTo(localFile);
  //              }
  //          }

  //          System.IO.File.WriteAllText(Path.Combine(assetPath, "apptitle.txt"), app.AppName);

  //          // Create zip file
  //          string zipFileName = $"AppConfig_{app.Id}.zip";
  //          string zipFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\assetdownload", zipFileName);
  //          if (System.IO.File.Exists(zipFilePath)) System.IO.File.Delete(zipFilePath);
            
  //          ZipFile.CreateFromDirectory(assetPath, zipFilePath);

  //          // Delete asset files
  //          var assetFiles = Directory.EnumerateFiles(assetPath);
  //          foreach(var file in assetFiles)
  //          {
  //              System.IO.File.Delete(file);
  //          }

  //          string zipVirtualPath = $"/assetdownload/{zipFileName}";
  //          return File(zipVirtualPath, "application/zip", zipFileName);
  //      }

  //      /// Update app event data for specified application
		//private async Task<bool> UpdateFirestoreAppDataAsync(int appId)
		//{
		//	string applicationId = shared.GetApplicationGuid(appId);
		//	var events = shared.GetApplicationEvents(appId);

  //          int? prostAppId = configuration.GetValue<int?>("ProstAppId");
  //          if (appId == prostAppId)
  //          {
  //              var prostEvents = shared.GetWhiteLabelProstEvents(prostAppId.Value);
  //              events.AddRange(prostEvents);
  //          }

		//	if (events.Count > 0)
		//	{
		//		return await firestore.WriteAppData(applicationId, events);
		//	}
		//	else return false;
		//}

        [Route("Admin/FoursquareSearch")]
        public async Task<IActionResult> FoursquareSearch(string location, string city, string state)
        {
            string near = $"{city}, {state}";
            var results = await foursquare.SearchAsync(near, location);
            return Json(results);
        }

		[Route("Admin/Events/Delete/{id}")]
		[HttpPost]
		public IActionResult DeleteEvent(int id)
		{
			bool deleted =_context.DeleteEvent(id);
			return Json(deleted);
		}

		[Route("Admin/Promoters/Delete/{id}")]
		[HttpPost]
		public IActionResult DeletePromoter(int id)
		{
			bool deleted = _context.DeletePromoter(id);
			return Json(deleted);
		}

	}
}
