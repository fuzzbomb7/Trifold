using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Trifold.Data;
using Trifold.Models;

namespace Trifold.Controllers
{
	/// <summary>
	/// Base controller for all user controllers
	/// </summary>
	public class BaseUserController : Controller
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly ISharedRepository shared;

        public BaseUserController(UserManager<ApplicationUser> userManager, ISharedRepository shared)
        {
            this.userManager = userManager;
            this.shared = shared;
        }

        public override async void OnActionExecuted(ActionExecutedContext context)
		{
			base.OnActionExecuted(context);

            var user = await userManager.FindByNameAsync(User.Identity.Name);

            if (await userManager.IsInRoleAsync(user, "Admin"))
            {
                context.HttpContext.Session.SetString("Company", "Admin User");
                context.HttpContext.Session.SetString("AccessToken", "admintoken"); // For display purposes only
            }
            else
            {
                var promoter = shared.GetEventPromoter(user.EventPromoterId.Value);

                context.HttpContext.Session.SetString("AccessToken", user.UntappdAccessToken ?? string.Empty);
                context.HttpContext.Session.SetString("Company", promoter?.CompanyName);
            }

            ViewData["Company"] = context.HttpContext.Session.GetString("Company");
			ViewData["AccessToken"] = context.HttpContext.Session.GetString("AccessToken");
        }
	}
}