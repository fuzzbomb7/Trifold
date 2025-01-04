using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class BeerSearchResponseModel
	{
		public List<Beers> Beers { get; set; } = new List<Beers>();
		public string Error { get; set; }
	}
}
