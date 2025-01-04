using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class JqueryAutocompleteModel
	{
		public List<Suggestions> suggestions { get; set; }
	}

	public class Suggestions
	{
		public string value { get; set; }
		public string data { get; set; }
	}
}
