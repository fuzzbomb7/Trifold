using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;
using Trifold.Services;

namespace TrifoldTest.IntegrationTests.Services
{
	[TestFixture]
	public class UntappdApiTests
	{
		IConfiguration _config;
		Mock<ILogger<UntappdApi>> _logger;

		[SetUp]
		public void SetUp()
		{
			var configBuilder = new ConfigurationBuilder();
			_config = configBuilder.AddJsonFile("secrets.json").Build();
			_logger = new Mock<ILogger<UntappdApi>>();
		}

		private UntappdApi CreateUntappdApi()
		{
			return new UntappdApi(new HttpClientService(), _config, _logger.Object);
		}

		[Test]
		public async Task SearchAsync_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateUntappdApi();
			string search = "Sierra Nevada Pale Ale";
			int offset = 0;
			int limit = 1;
			string accessToken = null;

			// Act
			var result = await unitUnderTest.SearchAsync(
				search,
				offset,
				limit,
				accessToken);

			// Assert
			Assert.AreEqual(result.response.beers.items[0].beer.beer_name, "Pale Ale");
		}

		[Test]
		public async Task Checkin_Test()
		{
			var test = this.CreateUntappdApi();

			string token = "735C863FFE8ABFD5EDD1F34B16113868EB143C9E";
			int beerId = 3051669;   // Change
			string gmtOffset = "-5";
			string timeZone = "CST";
			int rating = 5;
			string shout = "A good beer";
			double lat = 36.15910983490655;    // change
			double lng = -86.77836234155272;    // change
			string fourSquareId = "4b8c3d87f964a520f7c532e3";	//change

			var result = await test.CheckinAsync(token, beerId, rating, shout, gmtOffset, timeZone, lat, lng, fourSquareId);
			Assert.IsTrue(result.Success);
		}

	}
}
