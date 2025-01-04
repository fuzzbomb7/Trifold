using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class ListEventModel
    {
        public int EventId { get; set; }
        public string EventName { get; set; }
        public string EventStartTime { get; set; }
        public string EventEndTime { get; set; }
        public string EventCity { get; set; }
        public string EventState { get; set; }
    }

    public class EventsList
    {
        public List<ListEventModel> CurrentEvents { get; set; }
        public List<ListEventModel> UpcomingEvents { get; set; }
    }
}
