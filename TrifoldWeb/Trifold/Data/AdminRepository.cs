using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
	public class AdminRepository : IAdminRepository
	{
		public ApplicationDbContext Context { get; private set; }
		private ILogger _logger;

		public AdminRepository(ApplicationDbContext context, ILogger<AdminRepository> logger)
		{
			Context = context;
			_logger = logger;
		} 

		public List<EventPromoters> GetEventPromoters()
		{
			return Context.EventPromoters.ToList();
		}

		public int AddEventPromoter(EventPromoters promoter)
		{
			Context.EventPromoters.Add(promoter);
			return Context.SaveChanges();
		}
	
		public int UpdateEventPromoter(EventPromoters promoter)
		{
			Context.Update(promoter);
			return Context.SaveChanges();
		}

		public List<Events> GetEvents()
		{
			return Context.Events.Include(x => x.EventPromoter).ToList();
		}

        public List<Events> GetEvents(int promoterId)
        {
            return Context.Events.Where(x => x.EventPromoterId == promoterId).Include(x => x.EventPromoter).ToList();
        }

        public List<SelectListItem> GetEventPromoterSelectList()
		{
			return Context.EventPromoters.Select(x => new SelectListItem { Text = x.CompanyName, Value = x.Id.ToString() }).OrderBy(x => x.Text).ToList();
		}

		public int AddEvent(Events addEvent)
		{
			Context.Events.Add(addEvent);
			return Context.SaveChanges();
		}

		public int UpdateEvent(Events editEvent)
		{
            var removeModules = Context.Modules.Where(x => x.EventId == editEvent.Id);
            Context.Modules.RemoveRange(removeModules);

            Context.Update(editEvent);
			return Context.SaveChanges();
		}

		public List<Events> GetUpcomingEvents()
		{
			return Context.Events.Include(x => x.EventPromoter)
				.Where(x => x.IsActive == true && x.EventStartTime > DateTime.Today && x.EventStartTime < DateTime.Today.AddMonths(3))
				.OrderBy(x => x.EventStartTime).ToList();
		}

		public bool DeleteEvent(int eventId)
		{
			try
			{
				var eventData = Context.Events.Find(eventId);
				Context.Events.Remove(eventData);
				Context.SaveChanges();
				return true;
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error deleting event {eventId}", eventId);
				return false;
			}
		}

		public bool DeletePromoter(int promoterId)
		{
			try
			{
				var promoter = Context.EventPromoters.Include(x => x.Events).Where(x => x.Id == promoterId).FirstOrDefault();

				if (promoter.Events.Count > 0)
				{
					var eventIds = promoter.Events.Select(e => e.Id).ToList();
					foreach (var eventId in eventIds)
					{
						DeleteEvent(eventId);
					}
				}

				Context.EventPromoters.Remove(promoter);
				Context.SaveChanges();
				return true;
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error deleting promoter {promoterId}", promoterId);
				return false;
			}
		}

	}
}
