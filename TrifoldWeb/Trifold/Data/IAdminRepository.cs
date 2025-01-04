using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Rendering;
using Trifold.Models;

namespace Trifold.Data
{
	public interface IAdminRepository : IRepository
	{
		int AddEvent(Events addEvent);
		int AddEventPromoter(EventPromoters promoter);
		List<EventPromoters> GetEventPromoters();
		List<SelectListItem> GetEventPromoterSelectList();
		List<Events> GetEvents();
        List<Events> GetEvents(int eventPromoterId);
        int UpdateEvent(Events editEvent);
		int UpdateEventPromoter(EventPromoters promoter);
		List<Events> GetUpcomingEvents();
		bool DeleteEvent(int eventId);
		bool DeletePromoter(int promoterId);
    }
}