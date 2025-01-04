using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class EventsPageModel
	{
		public List<Events> UpcomingEvents { get; set; } = new List<Events>();
		public List<Events> PreviousEvents { get; set; } = new List<Events>();
	}
}
