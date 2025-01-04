using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Trifold.Data;
using Trifold.Models;

namespace Trifold.Controllers
{
	public class EventController : BaseEventController
    {
		private readonly IEventRepository repository;
        private readonly ISharedRepository shared;

        public EventController(IAuthorizationService authorization, IEventRepository repository, ISharedRepository shared, ILogger<EventController> logger, UserManager<ApplicationUser> userManager) 
			: base(authorization, logger, userManager, shared)
		{
			this.repository = repository;
            this.shared = shared;
        }

		[Route("{eventId}/Event")]
		public IActionResult Index(int eventId)
        {
            var model = shared.GetEvent(eventId);
			foreach(var module in model.Modules)
			{
				module.Data = repository.GetEventData(module);
			}

            //int? appId = shared.GetApplicationId(model.EventPromoterId);
            //model.App = shared.GetAppConfiguration(appId.Value);
			return View(model);
        }
    }
}