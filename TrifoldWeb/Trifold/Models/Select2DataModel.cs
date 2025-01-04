using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class Select2DataModel
	{
		public List<Select2OptionModel> Results { get; set; } = new List<Select2OptionModel>();
	}

	public class Select2OptionModel
	{
		public string Id { get; set; }
		public string Text { get; set; }
	}
}
