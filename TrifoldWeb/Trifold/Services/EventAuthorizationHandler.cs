using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;

namespace Trifold.Services
{
	/// <summary>
	/// User authorization handler for event access
	/// </summary>
	public class EventAuthorizationHandler : AuthorizationHandler<EventAuthorizationRequirement, int>
	{
		UserManager<ApplicationUser> _userManager;

		public EventAuthorizationHandler(UserManager<ApplicationUser> userManager)
		{
			_userManager = userManager;
		}

		protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, EventAuthorizationRequirement requirement, int resource)
		{
			// Admins have access to all pages
			if (context.User.IsInRole("Admin"))
			{
				context.Succeed(requirement);
			}
			else
			{
				// Check if user and event have same promoter
				var user = await _userManager.FindByNameAsync(context.User.Identity.Name);
				var userEventPromoter = user.EventPromoterId;
				var eventPromoter = resource;

				if (eventPromoter == userEventPromoter) context.Succeed(requirement);
			}

			return;
		}
	}

	public class EventAuthorizationRequirement : IAuthorizationRequirement {}

}
