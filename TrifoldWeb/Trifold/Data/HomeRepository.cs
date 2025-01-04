using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
    public class HomeRepository : IHomeRepository
    {
        public ApplicationDbContext Context { get; private set; }
        private ILogger logger;

        public HomeRepository(ApplicationDbContext context, ILogger<HomeRepository> logger, ISharedRepository shared)
        {
            Context = context;
            this.logger = logger;
        }

        public string GetHtmlContent(int eventId)
        {
            try
            {
                var content = Context.CustomContent.Where(x => x.EventId == eventId).FirstOrDefault();
                return content?.HtmlContent;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error getting custom html content. EventId: {eventId}", eventId);
                return null;
            }
        }

        public EventsList GetEvents()
        {
            var events = new EventsList();

            try
            {
                events.CurrentEvents = Context.Events.Where(x => x.IsActive && x.EventStartTime.Date <= DateTime.Today && x.EventEndTime >= DateTime.Today)
                    .Select(x => new ListEventModel
                    {
                        EventCity = x.EventCity,
                        EventEndTime = x.EventEndTime.ToLongDateString(),
                        EventId = x.Id,
                        EventName = x.EventName,
                        EventStartTime = x.EventStartTime.ToLongDateString(),
                        EventState = x.EventState
                    })
                    .ToList();

                events.UpcomingEvents = Context.Events.Where(x => x.IsActive && x.EventStartTime.Date >= DateTime.Today)
                    .OrderByDescending(x => x.EventStartTime)
                    .Select(x => new ListEventModel
                    {
                        EventCity = x.EventCity,
                        EventEndTime = x.EventEndTime.ToLongDateString(),
                        EventId = x.Id,
                        EventName = x.EventName,
                        EventStartTime = x.EventStartTime.ToLongDateString(),
                        EventState = x.EventState
                    })
                    .ToList();
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error getting events list for app front page");
            }

            return events;
        }

        public List<ListEventModel> SearchEvents(string searchTerm)
        {
            try
            {
                var searchEvents = Context.Events.Where(x => x.IsActive && x.EventName.ToLower().Contains(searchTerm.ToLower()))
                .Select(x => new ListEventModel
                {
                    EventCity = x.EventCity,
                    EventEndTime = x.EventEndTime.ToLongDateString(),
                    EventId = x.Id,
                    EventName = x.EventName,
                    EventStartTime = x.EventStartTime.ToLongDateString(),
                    EventState = x.EventState
                }).ToList();

                return searchEvents;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error searching for events. Term: {searchTerm}", searchTerm);
                return new List<ListEventModel>();
            }
        }

        public int? GetEventIdByShortcut(string shortcut)
        {
            try
            {
                int? eventId = Context.Events.Where(x => x.Promotion.PromoUrl.ToLower() == shortcut.ToLower()).FirstOrDefault()?.Id;
                return eventId;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error getting event Id for shortcut. Shortcut: {shortcut}", shortcut);
                return null;
            }
        }

    }
}
