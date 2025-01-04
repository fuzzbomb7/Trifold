using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;
using Trifold.Services;

namespace Trifold.Controllers
{
	/// <summary>
	/// Base class for event controllers
	/// </summary>
	public class BaseEventController : Controller
    {
		protected readonly IAuthorizationService authorization;
		protected readonly ILogger logger;
        private readonly UserManager<ApplicationUser> userManager;
        private readonly ISharedRepository shared;

        public BaseEventController(IAuthorizationService authorization, ILogger logger, UserManager<ApplicationUser> userManager, ISharedRepository shared)
		{
			this.authorization = authorization;
			this.logger = logger;
            this.userManager = userManager;
            this.shared = shared;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
			base.OnActionExecuting(context);
			int? eventId = null;

			try
			{
				// Confirm whether user is authorized to access this event
				// If not, send user back to their dashboard
				eventId = Convert.ToInt32(context.ModelState["eventId"]?.RawValue);

				if (eventId.HasValue && eventId > 0)
				{
					int? cachedEventId = context.HttpContext.Session.GetInt32("EventId");

					if (cachedEventId.HasValue && cachedEventId > 0)
					{
						// Session event ID matches, get view data and return
						if (cachedEventId == eventId)
						{
							ViewData["EventId"] = eventId.Value;
							ViewData["EventName"] = context.HttpContext.Session.GetString("EventName");
                            ViewData["DirtyData"] = Convert.ToBoolean(context.HttpContext.Session.GetInt32("DirtyData"));
                            ViewData["WhiteLabelId"] = context.HttpContext.Session.GetInt32("WhiteLabelId");
                            ViewData["Company"] = context.HttpContext.Session.GetString("Company");
                            ViewData["AccessToken"] = context.HttpContext.Session.GetString("AccessToken");

                            ViewBag.Modules = shared.GetModules(eventId.Value);
                            await next();
                            return;
						}
					}

					// Check if this event belongs to user
					var getEvent = shared.GetEvent(eventId.Value);

					if (authorization.Authorize(User, getEvent?.EventPromoterId))
					{
                        // Get promoter and app data
                        var promoter = shared.GetEventPromoter(getEvent.EventPromoterId);

						context.HttpContext.Session.SetInt32("EventId", eventId.Value);
                        context.HttpContext.Session.SetString("EventName", getEvent.EventName);
                        context.HttpContext.Session.SetInt32("DirtyData", Convert.ToInt32(getEvent.IsDirty));
                        //context.HttpContext.Session.SetInt32("WhiteLabelId", promoter?.App?.IsWhiteLabel == true ? promoter.App.Id : 0);
                        context.HttpContext.Session.SetString("Company", promoter?.CompanyName);

                        var user = await userManager.FindByNameAsync(User.Identity.Name);

                        if (await userManager.IsInRoleAsync(user, "Admin"))
                        {
                            context.HttpContext.Session.SetString("Company", "Admin User");
                        }
                        else
                        {
                            context.HttpContext.Session.SetString("AccessToken", user.UntappdAccessToken ?? string.Empty);
                        }

                        ViewData["EventId"] = eventId.Value;
						ViewData["EventName"] = getEvent.EventName;
                        ViewData["DirtyData"] = getEvent.IsDirty;
                        ViewData["WhiteLabelId"] = context.HttpContext.Session.GetInt32("WhiteLabelId");
                        ViewData["Company"] = context.HttpContext.Session.GetString("Company");
                        ViewData["AccessToken"] = context.HttpContext.Session.GetString("AccessToken");

                        ViewBag.Modules = shared.GetModules(eventId.Value);
					}
					else context.Result = RedirectToAction("Index", "User");
				}
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "BaseEventController.OnActionExecuting(): Exception verifying user event access. EventId: {EventId}, User: {User}", eventId, User.Identity.Name);
				context.Result = StatusCode(StatusCodes.Status500InternalServerError);
			}

            await next();
        }

	}
}