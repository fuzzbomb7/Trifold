using System.Collections.Generic;
using Trifold.Models;

namespace Trifold.Data
{
	public interface IHomeRepository : IRepository
	{
        string GetHtmlContent(int eventId);
        EventsList GetEvents();
        List<ListEventModel> SearchEvents(string searchTerm);
        int? GetEventIdByShortcut(string shortcut);
    }
}