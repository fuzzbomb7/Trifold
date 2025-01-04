using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Trifold.Data;
using Trifold.Models;

namespace Trifold.Controllers
{
    public class CustomController : BaseEventController
    {
        private readonly ICustomRepository repository;

        public CustomController(IAuthorizationService authorization, ILogger<CustomController> logger, ICustomRepository repository, UserManager<ApplicationUser> userManager, ISharedRepository shared) 
            : base(authorization, logger, userManager, shared)
        {
            this.repository = repository;
        }

        [Route("{eventId}/Custom")]
        public IActionResult Index(int eventId)
        {
            var content = repository.GetCustomContent(eventId);
            return View(content);
        }

        [Route("{eventId}/SaveUrl")]
        public IActionResult SaveUrl(string url, int eventId)
        {
            bool result = repository.SaveUrl(eventId, url);
            return Json(result);
        }

        [Route("{eventId}/SaveHtml")]
        public IActionResult SaveHtml(string html, int eventId)
        {
            bool result = repository.SaveHtmlContent(eventId, html);
            return Json(result);
        }

    }
}