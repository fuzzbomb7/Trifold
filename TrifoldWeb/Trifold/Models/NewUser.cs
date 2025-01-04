using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class NewUser
	{
		public string UserName { get; set; }
		public string Password { get; set; }
		public int? EventPromoterId { get; set; }
	}
}
