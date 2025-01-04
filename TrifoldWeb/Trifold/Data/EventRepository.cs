using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
	public class EventRepository : IEventRepository
	{
		public ApplicationDbContext Context { get; private set; }
		private ILogger _logger;

		public EventRepository(ApplicationDbContext context, ILogger<EventRepository> logger)
		{
			Context = context;
			_logger = logger;
		}

		public Dictionary<string, dynamic> GetEventData(Modules module)
		{
			var data = new Dictionary<string, dynamic>();

			if (module.ModuleId == ModuleEnum.Beer)
			{
				int beersCount = Context.Beers.Where(x => x.EventId == module.EventId).Count();
				data.Add("BeerCount", beersCount);
			}
			else if(module.ModuleId == ModuleEnum.Map)
			{
				bool hasMap = Context.Maps.Where(x => x.EventId == module.EventId).Any();
				data.Add("HasMap", hasMap);

				var locations = Context.Locations.Where(x => x.EventId == module.EventId);
				data.Add("Locations", locations.Count());

				int unplaced = locations.Where(x => x.Latitude == 0).Count();
				data.Add("Unplaced", unplaced);
			}
            else if(module.ModuleId == ModuleEnum.Custom)
            {
                var content = Context.CustomContent.Where(x => x.EventId == module.EventId).FirstOrDefault();

                data.Add("ContentUrl", !string.IsNullOrWhiteSpace(content?.Url));
                data.Add("ContentHtml", !string.IsNullOrWhiteSpace(content?.HtmlContent));
            }

			return data;
		}
	}
}
