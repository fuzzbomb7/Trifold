using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;
using Trifold.Services;

namespace Trifold.Controllers
{
	[AllowAnonymous]
	public class HomeController : Controller
	{
		private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ISharedRepository shared;
        private readonly UserManager<ApplicationUser> _userManager;
		private readonly ILogger _logger;
		private readonly IHomeRepository _repository;
		private readonly ISendGridService _email;
		private readonly ITwilioService _twilio;

		public HomeController(SignInManager<ApplicationUser> signIn, ISharedRepository shared, UserManager<ApplicationUser> userManager, ILogger<HomeController> logger, IHomeRepository repository, ISendGridService email, ITwilioService twilio)
		{
			_signInManager = signIn;
            this.shared = shared;
            _userManager = userManager;
			_logger = logger;
			_repository = repository;
			_email = email;
			_twilio = twilio;
		}

		public IActionResult Index()
		{
			return View();
		}

        // Temporary action for landing page
        public IActionResult Landing()
        {
            return View();
        }

        [HttpPost]
		public async Task<IActionResult> Index(string email)
		{
			await _email.AddToEmailListAsync(email);
			ViewData["SendResult"] = "Your email address has been added to our mailing list!";
			return View();
		}

		[Route("Login")]
		public IActionResult Login()
		{
			return View();
		}

		[Route("Login")]
		[HttpPost]
		public async Task<IActionResult> Login(Login login)
		{
			var result = await _signInManager.PasswordSignInAsync(login.Email, login.Password, login.RememberMe, false);

			if (result.Succeeded)
			{
				// Clear session and view data
				ViewData.Clear();
				HttpContext.Session.Clear();

                // Redirect
                var user = await _userManager.FindByNameAsync(login.Email);

                // TODO: redirect to page if param is passed

                if (await _userManager.IsInRoleAsync(user, "Admin"))
			    {
					return RedirectToAction("Index", "Admin");
				}
				else
				{
					return RedirectToAction("Index", "User");
				}
			}
			else
			{
				ModelState.AddModelError("Invalid", "Invalid username or password");
				return View(login);
			}
		}

		[Route("ResetPassword")]
		public IActionResult ResetPassword()
		{
			return View();
		}

		[Route("ResetPassword")]
		[HttpPost]
		public async Task<IActionResult> ResetPassword(string email)
		{
			var user = await _userManager.FindByEmailAsync(email);

			if (user != null)
			{
				var token = await _userManager.GeneratePasswordResetTokenAsync(user);
				string resetUrl = Url.Action("ChangePassword", "Home", new { token }, protocol: HttpContext.Request.Scheme);
				await _email.SendPasswordResetEmailAsync(email, resetUrl);
			}
			ViewData["Confirm"] = "A password reset link has been sent to your email";
			return View();
		}

		[Route("ChangePassword")]
		public IActionResult ChangePassword(string token)
		{
			return View((object)token);
		}

		[Route("ChangePassword")]
		[HttpPost]
		public async Task<IActionResult> ChangePassword(string token, string email, string password, string confirm)
		{
			if (password != confirm)
			{
				ViewData["Error"] = "Passwords do not match";
				return View();
			}
			else
			{
				var user = await _userManager.FindByEmailAsync(email);

				if (user != null)
				{
					var result = await _userManager.ResetPasswordAsync(user, token, password);

					if (result.Succeeded == false)
					{
						string error = string.Empty;
						foreach (var err in result.Errors)
						{
							error += err.Description + "\r\n";
						}
						ViewData["Error"] = error;
						return View();
					}
				}
				else
				{
					ViewData["Error"] = "User not found";
					return View();
				}
			}

			return LocalRedirect("/Login");

		}

		[Route("LogOut")]
		public async Task<IActionResult> LogOut()
		{
			await _signInManager.SignOutAsync();
			return LocalRedirect("/Login");
		}

		[Route("{eventId}/MapViewer/{mapFileGuid}")]
		[ResponseCache(Duration = 21600, Location = ResponseCacheLocation.Any)]
		public IActionResult MapViewer(int eventId, string mapFileGuid)
		{
			var map = shared.GetMap(eventId);
			if (Path.GetFileNameWithoutExtension(map.MapPath) != mapFileGuid) return NotFound();
            map.MapPath = shared.GetCDNLink(map.MapPath);
			return View(map);
		}

		[Route("Contact")]
		public IActionResult Contact()
		{
			return View();
		}

		[Route("Contact")]
		[HttpPost]
		public async Task<IActionResult> Contact(string name, string email, string message)
		{
			await _email.SendEmailAsync("sales@trifold.app", "Contact Form", message);
			ViewData["SendResult"] = "Your message has been sent!";
			return View();
		}

        [Route("{eventId}/CustomViewer")]
        public IActionResult CustomViewer(int eventId)
        {
            var html = _repository.GetHtmlContent(eventId);
            return View("CustomViewer", html);
        }

        public IActionResult Icons()
        {
            return View();
        }

        [Route("PrivacyPolicy")]
        public IActionResult PrivacyPolicy()
        {
            return View();
        }

        /*[Route("Feedback")]
        [HttpPost]
        public async Task<IActionResult> Feedback([FromBody] SupportRequestModel request)
        {
            bool valid = shared.CheckValidAppId(request.appId);
            if (valid == false) return BadRequest();

            string toAddress, subject, textContent, htmlContent;

            var eventData = shared.GetEvent(request.eventId);
            string eventName = eventData.EventName;
            string appName = "Prost";

            if ((SupportRequestType)request.requestType == SupportRequestType.Vendor)
            {
                toAddress = eventData.EventPromoter.ContactEmail;
                subject = "Trifold | Event Feedback";

                textContent = $"You have received feedback from a festival attendee using the {appName} app.\r\n\r\n" +
                    $"Event: {eventName}\r\n\r\n" +
                    request.message;

                htmlContent = $"<p>You have received feedback from a festival attendee using the {appName} app.</p>" +
                    $"<p><b>Event:</b> {eventName}</p>" +
                    $"<p>{request.message}</p>";
            }
            else
            {
                toAddress = "andrew@trifold.app";
                subject = "App Support/Feedback";

                textContent = $"App: {appName}\r\n" +
                    $"Event: {eventName} (ID: {request.eventId})\r\n" +
                    $"Device: {request.manufacturer} {request.model}\r\n" +
                    $"OS: {request.osVersion}\r\n\r\n" +
                    $"{request.message}";

                htmlContent = $"<b>App:</b> {appName}<br>" +
                    $"<b>Event:</b> {eventName} (ID: {request.eventId})<br>" +
                    $"<b>Device:</b> {request.manufacturer} {request.model}<br>" +
                    $"<b>SDK:</b> {request.osVersion}<br>" +
                    $"<p>{request.message}</p>";
            }

            await _email.SendEmailAsync(toAddress, subject, textContent, htmlContent, request.emailAddress);

            return Ok();
        }*/

		[EnableCors("Api")]
		[Route("GetEvents")]
		public IActionResult GetEvents()
		{
			var events = _repository.GetEvents();
			return Json(events);
		}

		[EnableCors("Api")]
		[Route("SearchEvents")]
		public IActionResult SearchEvents(string searchTerm)
		{
			var events = _repository.SearchEvents(searchTerm);
			return Json(events);
		}

		[EnableCors("Api")]
		[Route("Shortcut")]
		public IActionResult Shortcut(string shortcut)
		{
			int? eventId = _repository.GetEventIdByShortcut(shortcut);
			return Json(eventId);
		}

		[EnableCors("Api")]
		[Route("SendSms")]
		[HttpPost]
		public IActionResult SendSms(int eventId, string phoneNumber)
		{
			Events getEvent = shared.GetEvent(eventId);

			string usePhoneNumber = "+1" + phoneNumber.Trim();
			string message = $"Here is the mobile web app URL for {getEvent?.EventName}: https://trifold.app/{getEvent.Promotion.PromoUrl}";

			bool success = _twilio.SendSMS(usePhoneNumber, message);
			
			return Json(success);
		}

	}
}
