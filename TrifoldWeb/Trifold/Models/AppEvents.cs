using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class AppEvents
	{
		public int Id { get; set; }
		public int AppId { get; set; }
		public int EventId { get; set; }
		[ForeignKey("AppId")]
		public Apps App { get; set; }
		[ForeignKey("EventId")]
		public Events Event { get; set; }
	}
}
