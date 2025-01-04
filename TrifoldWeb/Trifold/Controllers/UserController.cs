using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Trifold.Data;
using Trifold.Models;

namespace Trifold.Controllers
{
	public class UserController : Controller
	{
		private readonly IUserRepository repository;
		private readonly UserManager<ApplicationUser> userManager;
        private readonly ISharedRepository shared;
        private readonly IConfiguration configuration;

        public UserController(IUserRepository repository, UserManager<ApplicationUser> userManager, ISharedRepository shared, IConfiguration configuration)
		{
			this.repository = repository;
			this.userManager = userManager;
            this.shared = shared;
            this.configuration = configuration;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            base.OnActionExecuting(context);

            if (User.IsInRole("Admin"))
            {
                context.HttpContext.Session.SetString("Company", "Admin User");
                await next();
                return;
            }

            // Get event promoter id
            int? eventPromoterId = context.HttpContext.Session.GetInt32("EventPromoterId");

            if (eventPromoterId == null)
            {
                var user = await userManager.GetUserAsync(User);
                eventPromoterId = user.EventPromoterId;

                // User must have an event promoter assigned
                if(eventPromoterId == null)
                {
                    throw new Exception("User does not have an event promoter ID assigned!");
                }

                context.HttpContext.Session.SetInt32("EventPromoterId", eventPromoterId.Value);
            }

            // Get company name for user menu display
            string company = context.HttpContext.Session.GetString("Company");

            if(company == null)
            {
                var promoter = shared.GetEventPromoter(eventPromoterId.Value);
                company = promoter?.CompanyName;
                context.HttpContext.Session.SetString("Company", promoter?.CompanyName);
            }

            //// Get white-label app id for mobile menu display
            //int? whiteLabelId = context.HttpContext.Session.GetInt32("WhiteLabelId");

            //if (whiteLabelId == null)
            //{
            //    whiteLabelId = shared.GetWhiteLabelAppId(eventPromoterId.Value);
            //    context.HttpContext.Session.SetInt32("WhiteLabelId", whiteLabelId.Value);
            //}

            // Get access token for user menu display
            string accessToken = context.HttpContext.Session.GetString("AccessToken");

            if(accessToken == null)
            {
                var user = await userManager.GetUserAsync(User);
                accessToken = user.UntappdAccessToken ?? string.Empty;
                context.HttpContext.Session.SetString("AccessToken", user.UntappdAccessToken ?? string.Empty);
            }

            //ViewData["WhiteLabelId"] = whiteLabelId;
            ViewData["Company"] = company;
            ViewData["AccessToken"] = accessToken;

            await next();
        }

        /// <summary>
        /// User dashboard
        /// </summary>
        /// <returns></returns>
        [Route("Events")]
        public IActionResult Index()
        {
            if (User.IsInRole("Admin")) return RedirectToAction("Events", "Admin");

            var model = new EventsPageModel();
            int? eventPromoterId = HttpContext.Session.GetInt32("EventPromoterId");

            if (eventPromoterId != null)
            {
                // Load events
                model.PreviousEvents = repository.GetPreviousEvents(eventPromoterId.Value);
                model.UpcomingEvents = repository.GetUpcomingEvents(eventPromoterId.Value);
            }

            return View(model);
        }

        /// <summary>
        /// Untappd integration confirmation page
        /// </summary>
        /// <param name="success"></param>
        /// <returns></returns>
        public IActionResult UntappdConfirm(bool success)
		{
			return View(success);
		}

	}
}