using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class EventPromoters
	{
		public int Id { get; set; }
		public string CompanyName { get; set; }
		public string ContactName { get; set; }
		[EmailAddress]
		public string ContactEmail { get; set; }
		[Url]
		public string Website { get; set; }
		public string Address { get; set; }
		public string City { get; set; }
		public string State { get; set; }
		public string Zip { get; set; }
		public string Phone { get; set; }
		public List<Events> Events { get; set; }
		//public int? AppId { get; set; }
		//[ForeignKey("AppId")]
		//public Apps App { get; set; }
	}
}
