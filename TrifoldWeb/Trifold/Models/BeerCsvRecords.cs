using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Data;

namespace Trifold.Models
{
	public class BeerCsvRecords : CsvRecord
	{
		public string Brewery { get; set; }
		public string Beer { get; set; }
		public string UntappdId { get; set; }
		public string City { get; set; }
		public string Style { get; set; }
		public string ABV { get; set; }
		public string IBU { get; set; }
		public string Description { get; set; }
        public string UntappdBrewery { get; set; }
        public string UntappdBeer { get; set; }
		public int? Table { get; set; }
	}

	
}
