using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class Modules
	{
		public int Id { get; set; }
		public int EventId { get; set; }
		public ModuleEnum ModuleId { get; set; }
		[ForeignKey("EventId")]
		public Events Event { get; set; }
		[NotMapped]
		public Dictionary<string, dynamic> Data { get; set; }
	}
}
