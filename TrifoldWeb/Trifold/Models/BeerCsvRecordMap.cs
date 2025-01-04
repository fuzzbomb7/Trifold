using CsvHelper.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class BeerCsvRecordMap : ClassMap<BeerCsvRecords>
	{
		public BeerCsvRecordMap()
		{
			Map(m => m.ABV).Optional();
			Map(m => m.Beer);
			Map(m => m.Brewery);
			Map(m => m.City).Optional();
			Map(m => m.Description).Optional();
			Map(m => m.IBU).Optional();
			Map(m => m.Style).Optional();
			Map(m => m.UntappdId).Optional();
			Map(m => m.Table).Optional();
		}
	}
}
