using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class MobileTokens
	{
		public int Id { get; set; }
		public string Token { get; set; }
		//public string AppGuid { get; set; }
		public string DeviceId { get; set; }
		public DateTime AddDate { get; set; }
	}
}
