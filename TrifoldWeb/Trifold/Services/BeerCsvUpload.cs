using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CsvHelper;
using Trifold.Data;
using Trifold.Models;

namespace Trifold.Services
{
	public class BeerCsvUpload
	{
		public BeerCsvUpload()
		{
		}

		public static List<BeerCsvRecords> ReadFromFile(StreamReader stream)
		{
			using (var csv = new CsvReader(stream))
			{
				csv.Configuration.RegisterClassMap<BeerCsvRecordMap>();
                return csv.GetRecords<BeerCsvRecords>().ToList();
			}
		}

		public static void PreProcessFile(ref List<BeerCsvRecords> records, int csvUploadId, int eventId)
		{
			foreach (var record in records)
			{
				record.CsvUploadId = csvUploadId;
                record.Brewery = record.Brewery.Trim();               

				// Check for Untappd ID
				if (!string.IsNullOrWhiteSpace(record.UntappdId))
				{
					int untappdId = 0;
					bool checkId = int.TryParse(record.UntappdId.Trim(), out untappdId);

					if (checkId == false)
					{
                        record.Processed = CsvRecordProcessingEnum.AddedDirect;
                        record.Error = "Add directly (no Untappd integration)";
						record.UntappdId = "SKIP";
					}
					else if (untappdId > 0)
					{
						record.UntappdId = untappdId.ToString();
					}
					else record.UntappdId = string.Empty;
				}		
			}
		}

		public static Beers ProcessManualBeerEntry(BeerCsvRecords record, int eventId)
		{
			var beer = new Beers();
			beer.Brewery = new Breweries();
			beer.BeerName = record.Beer;
			beer.Brewery.BreweryName = record.Brewery;
			beer.EventId = eventId;

			beer.Abv = ProcessAbvEntry(record.ABV);
			beer.Ibu = ProcessIbuEntry(record.IBU);

			beer.Brewery.BreweryCity = record.City?.Trim();
			beer.Description = record.Description?.Trim();
			beer.Style = record.Style?.Trim();

			return beer;
		}

		public static int ProcessIbuEntry(string ibuString)
		{
			if (string.IsNullOrWhiteSpace(ibuString)) return 0;

			int ibu = 0;
			string stripIbu = new string(ibuString.Where(c => char.IsDigit(c)).ToArray());
			bool isIbu = int.TryParse(stripIbu, out ibu);
			return isIbu ? ibu : 0;
		}

		public static double ProcessAbvEntry(string abvString)
		{
			if (string.IsNullOrWhiteSpace(abvString)) return 0;

			double abv = 0;
			string stripAbv = Regex.Replace(abvString, "[^0-9.]", "");
			bool isAbv = double.TryParse(stripAbv, out abv);
			return isAbv ? Math.Round(abv, 1) : 0;
		}

	}
}
