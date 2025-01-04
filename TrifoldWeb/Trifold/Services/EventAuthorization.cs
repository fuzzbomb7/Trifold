using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Trifold.Data;

namespace Trifold.Services
{
	/// <summary>
	/// Extension method for IAuthorizationService
	/// </summary>
	public static class EventAuthorization
	{
		/// <summary>
		/// Ensures that logged-in user has access to a navigated-to event
		/// </summary>
		/// <param name="service">Injected authorization service</param>
		/// <param name="dbContext">Injected database context</param>
		/// <param name="user">User property from controller</param>
		/// <param name="eventId">Event Id</param>
		/// <returns>True if user has access</returns>
		public static bool Authorize(this IAuthorizationService service, ClaimsPrincipal user, int? eventPromoterId)
		{
			try
			{
				var authorize = service.AuthorizeAsync(user, eventPromoterId, "EventPolicy");
				return authorize.Result.Succeeded;
			}
			catch (Exception)
			{
				return false;
			}
		}
	}
}
