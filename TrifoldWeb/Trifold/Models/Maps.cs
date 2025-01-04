using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class Maps
	{
		public int Id { get; set; }
		public int EventId { get; set; }
		public string MapPath { get; set; }
		public int Height { get; set; }
		public int Width { get; set; }
		[ForeignKey("EventId")]
		public Events Event { get; set; }
	}
}
