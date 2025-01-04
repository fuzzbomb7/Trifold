using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using Trifold.Models;
using Trifold.Services;

namespace TrifoldTest.Services
{
	[TestFixture]
	public class BeerCsvUploadTests
	{
		[Test]
		public void PreProcessFile_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			int csvUploadId = 1;
			int eventId = 1;

			List<BeerCsvRecords> records = new List<BeerCsvRecords>()
			{
				new BeerCsvRecords()
				{
					Beer = "Pale Ale",
					Brewery = "Sierra Nevada",
					UntappdId = ""
				},
				new BeerCsvRecords()
				{
					Beer = "Pale Ale",
					Brewery = "Sierra Nevada",
					UntappdId = "1234 "
				},
				new BeerCsvRecords()
				{
					Beer = "",
					Brewery = "Sierra Nevada",
					UntappdId = ""
				},
				new BeerCsvRecords()
				{
					Beer = "Pale Ale",
					Brewery = "",
					UntappdId = ""
				},
				new BeerCsvRecords()
				{
					Beer = "Pale Ale",
					Brewery = "Sierra Nevada",
					UntappdId = "SKIP "
				},

			};

			// Act
			BeerCsvUpload.PreProcessFile(
				ref records,
				csvUploadId,
				eventId);

			// Assert
			Assert.AreEqual(records[0].UntappdId, string.Empty);
			Assert.AreEqual(records[1].UntappdId, "1234");
			Assert.AreEqual(records[2].Error, "Beer column is required");
			Assert.AreEqual(records[3].Error, "Brewery column is required");
			Assert.AreEqual(records[4].UntappdId, "SKIP");
		}

		[Test]
		public void ProcessManualBeerEntry_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			BeerCsvRecords record = new BeerCsvRecords()
			{
				Beer = "Pale Ale",
				Brewery = "Sierra Nevada",
				ABV = "5.2%",
				City = "Chico, CA  ",
				Description = null,
				IBU = "100 IBU",
				Style = "Pale Ale"
			};

			int eventId = 1;

			// Act
			var result = BeerCsvUpload.ProcessManualBeerEntry(
				record,
				eventId);

			// Assert
			Assert.AreEqual(result.EventId, 1);
			Assert.AreEqual(result.Abv, 5.2);
			Assert.AreEqual(result.Ibu, 100);
			Assert.AreEqual(result.Brewery.BreweryCity, "Chico, CA");
			Assert.AreEqual(result.Description, null);
			Assert.AreEqual(result.Style, "Pale Ale");
		}
	}
}
