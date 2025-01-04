using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class EventLocationModel
	{
		public string TimeZone { get; set; }
		public double Latitude { get; set; }
		public double Longitude { get; set; }
		public string FoursquareId { get; set; }
	}
}
