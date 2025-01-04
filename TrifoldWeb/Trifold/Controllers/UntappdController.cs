using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;
using Trifold.Services;

namespace Trifold.Controllers
{
	[AllowAnonymous]
	public class UntappdController : Controller
	{
		private readonly IConfiguration _configuration;
		private UserManager<ApplicationUser> _userManager;
		private readonly ILogger _logger;
		private IUntappdApi _untappdApi;
		private readonly IUntappdRepository repository;

		public UntappdController(IConfiguration configuration, UserManager<ApplicationUser> userManager, ILogger<UntappdController> logger, IUntappdApi untappdApi, IUntappdRepository repository)
		{
			_configuration = configuration;
			_userManager = userManager;
			_logger = logger;
			_untappdApi = untappdApi;
			this.repository = repository;
		}

		/// <summary>
		/// First step of Untappd authentication
		/// </summary>
		/// <param name="isMobile">True if request is from the mobile app</param>
		/// <param name="deviceId">Mobile device id.</param>
		/// <returns></returns>
		public IActionResult Auth(bool isMobile = false, string deviceId = null)
		{
			string state = string.Empty;

			if (isMobile == false)
			{
				var userId = _userManager.GetUserId(User);
				if (userId == null)
				{
					return new StatusCodeResult(StatusCodes.Status400BadRequest);
				}

				state = $"local:{userId}";
			}
			else
			{
				if(deviceId == null)
				{
					return new StatusCodeResult(StatusCodes.Status400BadRequest);
				}

				state = $"mobile:{deviceId}";
			}

			string clientId = _configuration["UntappdApiKey"];
			string redirect = _configuration["UntappdApiRedirectUrl"];

			return Redirect($"https://untappd.com/oauth/authenticate/?client_id={clientId}&response_type=code&redirect_url={redirect}&state={state}");
		}

		/// <summary>
		/// Callback from Untappd authentication
		/// </summary>
		/// <param name="code">Authorization code returned from Untappd</param>
		/// <param name="state">State parameter returned from Untappd</param>
		/// <returns></returns>
		public async Task<IActionResult> Callback(string code, string state)
		{
			var result = await _untappdApi.AuthorizeAsync(code);

			if(result.Success == true)
			{
				string accessToken = result.AccessToken;
				var splitState = state.Split(':');

				// Associate token with local user account
				if (splitState[0] == "local")
				{
					IdentityResult update = null;

					try
					{
						string userId = splitState[1];
						var user = await _userManager.FindByIdAsync(userId);
						user.UntappdAccessToken = accessToken;

						update = await _userManager.UpdateAsync(user);
					}
					catch (System.Exception ex)
					{
						_logger.LogError(ex, "Local authentication error. State: {state}, Access Token: {accessToken}", state, accessToken);
						RedirectToAction("UntappdConfirm", "User", new { success = false });
					}

					HttpContext.Session.SetString("AccessToken", accessToken);
					return RedirectToAction("UntappdConfirm", "User", new { success = update.Succeeded });
				}

				// Save token to database for later retrieval (mobile users)
				else if(splitState[0] == "mobile")
				{
					string deviceId = splitState[1];

					if (!string.IsNullOrWhiteSpace(deviceId))
					{
						bool setToken = repository.SetToken(deviceId, accessToken);

						if(setToken)
						{
							return RedirectToAction("Success");
						}
					}
				}
			}

			return RedirectToAction("Error");
		}

		/// <summary>
		/// Retrieve Untappd token from earlier authentication
		/// </summary>
		/// <param name="deviceId">Mobile device id</param>
		/// <returns></returns>
		[EnableCors("Api")]
		public IActionResult GetToken(string deviceId)
		{
			var token = repository.GetToken(deviceId);
			return Json(token);
		}

		// Error and Success pages (mobile ready)
		public IActionResult Success()
		{
			return View();
		}

		public IActionResult Error()
		{
			return View();
		}

		/// <summary>
		/// Check a beer into Untappd
		/// </summary>
		/// <param name="token">Untappd authentication token</param>
		/// <param name="eventId">Event id</param>
		/// <param name="beerId">Untappd beer id</param>
		/// <param name="rating">Rating (1-5)</param>
		/// <param name="shout">Comment</param>
		/// <param name="gmtOffset">GMT Offset (from device)</param>
		/// <returns></returns>
		[HttpPost]
		[EnableCors("Api")]
		public async Task<IActionResult> Checkin(string token, int eventId, int beerId, double rating, string shout, string gmtOffset)
		{
			var eventLocation = repository.GetEventLocationInfo(eventId);

			var result = await _untappdApi.CheckinAsync(token, beerId, rating, shout, gmtOffset, eventLocation.TimeZone, eventLocation.Latitude, eventLocation.Longitude, eventLocation.FoursquareId);
			return Json(result);
		}

		/// <summary>
		/// Get currently logged-in user
		/// </summary>
		/// <param name="token">User token</param>
		/// <returns></returns>
		[EnableCors("Api")]
		public async Task<IActionResult> GetUser(string token)
        {
            var result = await _untappdApi.GetUserAsync(token);
            var model = new UntappdUserResultModel();
            model.AvatarUrl = result.response.user.user_avatar;
            model.UserName = result.response.user.user_name;
            model.Name = $"{result.response.user.first_name} {result.response.user.last_name}";
            return Json(model);
        }

	}
}
