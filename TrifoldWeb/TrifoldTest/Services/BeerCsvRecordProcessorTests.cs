using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;
using Trifold.Services;
using static Trifold.Services.BeerCsvRecordProcessor;

namespace TrifoldTest.Services
{
	[TestFixture]
	public class BeerCsvRecordProcessorTests
	{
		private MockRepository mockRepository;

		private Mock<IBeerRepository> mockBeerRepository;
		private Mock<IUntappdApi> mockUntappdApi;
		private Mock<ILogger<BeerCsvRecordProcessor>> mockLogger;
		private Mock<ISendGridService> mockEmail;

		UntappdSearchResponseModel searchResult;
		BeerCsvRecords record;
		CsvFileUploads file;
		CsvRecordCount count;

		[SetUp]
		public void SetUp()
		{
			this.mockRepository = new MockRepository(MockBehavior.Default);

			this.mockBeerRepository = this.mockRepository.Create<IBeerRepository>();
			this.mockUntappdApi = this.mockRepository.Create<IUntappdApi>();
			this.mockLogger = this.mockRepository.Create<ILogger<BeerCsvRecordProcessor>>();
			this.mockEmail = this.mockRepository.Create<ISendGridService>();

			searchResult = new UntappdSearchResponseModel();
			searchResult.response = new Response();
			searchResult.response.beers = new BeerResults();
			searchResult.response.beers.count = 1;
			searchResult.response.beers.items = new System.Collections.Generic.List<Item>();
			var item = new Item();
			item.beer = new Beer();
			item.beer.beer_abv = 5.2f;
			item.beer.beer_ibu = 100;
			item.beer.beer_name = "Pale Ale";
			item.beer.beer_style = "IPA - American";
			item.beer.beer_description = "The classic American pale ale";
			item.beer.bid = 123;
			item.brewery = new Brewery();
			item.brewery.brewery_name = "Sierra Nevada";
			item.brewery.location = new Location();
			item.brewery.location.brewery_city = "Chico";
			item.brewery.location.brewery_state = "CA";
			searchResult.response.beers.items.Add(item);

			record = new BeerCsvRecords()
			{
				Beer = "Pale Ale",
				Brewery = "Sierra Nevada",
				CsvUploadId = 1,
				CsvFileUploads = new CsvFileUploads()
				{
					EventId = 1
				},
				Processed = CsvRecordProcessingEnum.NotProcessed,
				Id = 1
			};

			file = new CsvFileUploads()
			{
				Id = 1,
				Progress = CsvFileProgress.InProgress
			};

			count = new CsvRecordCount()
			{
				Completed = 5,
				Total = 10
			};
		}

		[TearDown]
		public void TearDown()
		{
			this.mockRepository.VerifyAll();
		}

		private BeerCsvRecordProcessor CreateBeerCsvRecordProcessor()
		{
			return new BeerCsvRecordProcessor(
				this.mockBeerRepository.Object,
				this.mockUntappdApi.Object,
				this.mockLogger.Object,
				this.mockEmail.Object);
		}

		[Test]
		public async Task ProcessNextRecordAsync_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			mockBeerRepository.Setup(x => x.GetNextBeerCsvRecord()).Returns(record);
			mockBeerRepository.Setup(x => x.UpdateBeerCsvRecord(It.IsAny<BeerCsvRecords>())).Returns(true);
			mockBeerRepository.Setup(x => x.AddBeer(It.IsAny<Beers>())).Returns(true);
			mockBeerRepository.Setup(x => x.GetCsvFileUpload(It.IsAny<int>())).Returns(file);
			mockBeerRepository.Setup(x => x.GetCsvRecordCount(It.IsAny<int>())).Returns(count);

			mockUntappdApi.Setup(x => x.SearchAsync(It.IsAny<string>(), 0, 1, null))
				.ReturnsAsync(searchResult);

			var unitUnderTest = this.CreateBeerCsvRecordProcessor();

			// Act
			var result = await unitUnderTest.ProcessNextRecordAsync();

			// Assert
			Assert.AreEqual(result, ProcessState.Success);
			Assert.AreEqual(unitUnderTest.ProcessRecord.Processed, CsvRecordProcessingEnum.AddedUntappd);
		}

		[Test]
		public async Task ProcessNextRecordAsync_OverrideIbuAbvDescription()
		{
			// Arrange
			var overrideRecord = new BeerCsvRecords()
			{
				ABV = "6.9",
				IBU = "69",
				Description = "A classic ale",
				Beer = "Pale Ale",
				Brewery = "Sierra Nevada",
				City = "Chico, CA",
				CsvUploadId = 1,
				CsvFileUploads = new CsvFileUploads()
				{
					EventId = 1
				},
				Processed = CsvRecordProcessingEnum.NotProcessed,
				Id = 1
			};

			mockBeerRepository.Setup(x => x.GetNextBeerCsvRecord()).Returns(overrideRecord);
			mockBeerRepository.Setup(x => x.UpdateBeerCsvRecord(It.IsAny<BeerCsvRecords>())).Returns(true);
			mockBeerRepository.Setup(x => x.AddBeer(It.IsAny<Beers>())).Returns(true);
			mockBeerRepository.Setup(x => x.GetCsvFileUpload(It.IsAny<int>())).Returns(file);
			mockBeerRepository.Setup(x => x.GetCsvRecordCount(It.IsAny<int>())).Returns(count);

			mockUntappdApi.Setup(x => x.SearchAsync(It.IsAny<string>(), 0, 1, null))
				.ReturnsAsync(searchResult);

			var unitUnderTest = this.CreateBeerCsvRecordProcessor();

			// Act
			var result = await unitUnderTest.ProcessNextRecordAsync();

			// Assert
			Assert.AreEqual(result, ProcessState.Success);
			Assert.AreEqual(unitUnderTest.AddBeer.Description, "A classic ale");
			Assert.AreEqual(unitUnderTest.AddBeer.Abv, 6.9);
			Assert.AreEqual(unitUnderTest.AddBeer.Ibu, 69);
		}

		[Test]
		public async Task ProcessNextRecordAsync_NoRecords()
		{
			mockBeerRepository.Setup(x => x.GetNextBeerCsvRecord()).Returns(new BeerCsvRecords());

			var unitUnderTest = this.CreateBeerCsvRecordProcessor();

			// Act
			var result = await unitUnderTest.ProcessNextRecordAsync();

			// Assert
			Assert.AreEqual(result, ProcessState.SuccessNoRecords);
		}

		[Test]
		public async Task ProcessNextRecordAsync_NoSearchResponse()
		{
			mockBeerRepository.Setup(x => x.GetNextBeerCsvRecord()).Returns(record);
			mockBeerRepository.Setup(x => x.GetCsvFileUpload(It.IsAny<int>())).Returns(file);
			mockBeerRepository.Setup(x => x.GetCsvRecordCount(It.IsAny<int>())).Returns(count);

			mockUntappdApi.Setup(x => x.SearchAsync(It.IsAny<string>(), 0, 1, null))
				.ReturnsAsync(new UntappdSearchResponseModel());

			mockBeerRepository.Setup(x => x.UpdateBeerCsvRecord(It.IsAny<BeerCsvRecords>())).Returns(true);

			var unitUnderTest = this.CreateBeerCsvRecordProcessor();

			// Act
			var result = await unitUnderTest.ProcessNextRecordAsync();

			// Assert
			Assert.AreEqual(result, ProcessState.Error);
			Assert.AreEqual(unitUnderTest.ProcessRecord.Processed, CsvRecordProcessingEnum.NotProcessed);
		}

		[Test]
		public async Task ProcessNextRecordAsync_NoSearchResults()
		{
			var noSearchResult = new UntappdSearchResponseModel();
			noSearchResult.response = new Response();
			noSearchResult.response.beers = new BeerResults();
			noSearchResult.response.beers.count = 0;

			mockUntappdApi.Setup(x => x.SearchAsync(It.IsAny<string>(), 0, 1, null))
				.ReturnsAsync(noSearchResult);

			mockBeerRepository.Setup(x => x.GetNextBeerCsvRecord()).Returns(record);
			mockBeerRepository.Setup(x => x.UpdateBeerCsvRecord(It.IsAny<BeerCsvRecords>())).Returns(true);
			mockBeerRepository.Setup(x => x.AddBeer(It.IsAny<Beers>())).Returns(true);
			mockBeerRepository.Setup(x => x.GetCsvFileUpload(It.IsAny<int>())).Returns(file);
			mockBeerRepository.Setup(x => x.GetCsvRecordCount(It.IsAny<int>())).Returns(count);

			var unitUnderTest = this.CreateBeerCsvRecordProcessor();

			// Act
			var result = await unitUnderTest.ProcessNextRecordAsync();

			// Assert
			Assert.AreEqual(result, ProcessState.SuccessManual);
			Assert.AreEqual(unitUnderTest.ProcessRecord.Processed, CsvRecordProcessingEnum.AddedUntappd);
		}

	}
}
