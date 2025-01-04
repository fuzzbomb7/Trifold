using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class UntappdCheckinResult
	{
		public bool Success { get; set; }
		public string Error { get; set; }
	}

	public class UntappdAuthResult : UntappdCheckinResult
	{
		public string AccessToken { get; set; }
	}

	public class UntappedCheckinRequest
	{
		public string access_token { get; set; }
		public string gmt_offset { get; set; }
		public string timezone { get; set; }
		public int bid { get; set; }
		public string foursquare_id { get; set; }
		public double geolat { get; set; }
		public double geolng { get; set; }
		public string shout { get; set; }
		public int rating { get; set; }
	}
}
