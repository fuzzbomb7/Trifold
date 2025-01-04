using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;
using Trifold.Controllers;
using Trifold.Data;
using Trifold.Models;
using Trifold.Services;

namespace TrifoldTest.Controllers
{
	[TestFixture]
	public class BeerControllerTests
	{
		private MockRepository mockRepository;

		private Mock<IBeerRepository> mockBeerRepository;
		private Mock<IAuthorizationService> mockAuthorizationService;
		private Mock<IHttpClient> mockHttpClient;
		private Mock<IConfiguration> mockConfiguration;
		private Mock<UserManager<ApplicationUser>> mockUserManager;
		private Mock<ILogger<BeerController>> mockLogger;

		private Beers testBeer;

		[SetUp]
		public void SetUp()
		{
			this.mockRepository = new MockRepository(MockBehavior.Strict);

			this.mockBeerRepository = this.mockRepository.Create<IBeerRepository>();
			this.mockAuthorizationService = this.mockRepository.Create<IAuthorizationService>();
			this.mockHttpClient = this.mockRepository.Create<IHttpClient>();
			this.mockConfiguration = this.mockRepository.Create<IConfiguration>();
			var userStore = new Mock<IUserStore<ApplicationUser>>();
			this.mockUserManager = new Mock<UserManager<ApplicationUser>>(userStore.Object, null, null, null, null, null, null, null, null);
			this.mockLogger = this.mockRepository.Create<ILogger<BeerController>>();

			this.testBeer = new Beers()
			{
				Abv = 5.2,
				BeerName = "Pale Ale",
				BreweryCity = "Chico, CA",
				BreweryName = "Sierra Nevada",
				Description = "The OG West Coast IPA",
				EventId = 1,
				Ibu = 100,
				Style = "IPA - West Coast",
			};
		}

		[TearDown]
		public void TearDown()
		{
			this.mockRepository.VerifyAll();
		}

		private BeerController CreateBeerController()
		{
			return new BeerController(
				this.mockBeerRepository.Object,
				this.mockAuthorizationService.Object,
				this.mockHttpClient.Object,
				this.mockConfiguration.Object,
				this.mockUserManager.Object,
				this.mockLogger.Object);
		}

		[Test]
		public void Import_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			int eventId = 1;

			// Act
			var result = unitUnderTest.Import(
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void List_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			int eventId = 1;

			// Act
			var result = unitUnderTest.List(
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void Get_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			int beerId = 1;
			int eventId = 1;

			// Act
			var result = unitUnderTest.Get(
				beerId,
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void GetAll_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			int eventId = 1;

			// Act
			var result = unitUnderTest.GetAll(
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void Edit_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			Beers beer = testBeer;
			int eventId = 1;

			// Act
			var result = unitUnderTest.Edit(
				beer,
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void Delete_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			int beerId = 1;
			int eventId = 1;

			// Act
			var result = unitUnderTest.Delete(
				beerId,
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public async Task Search_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			string search = "PALE ALE";
			int offset = 0;
			int limit = 25;

			// Act
			var result = await unitUnderTest.Search(
				search,
				offset,
				limit);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void AddBeer_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			int eventId = 1;
			Beers beer = testBeer;

			// Act
			var result = unitUnderTest.AddBeer(
				eventId,
				beer);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void BreweryAutocomplete_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			string q = "sam";
			int eventId = 1;

			// Act
			var result = unitUnderTest.BreweryAutocomplete(
				q,
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void StyleAutocomplete_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			string q = "ip";
			int eventId = 1;

			// Act
			var result = unitUnderTest.StyleAutocomplete(
				q,
				eventId);

			// Assert
			Assert.Fail();
		}

		[Test]
		public void CityAutocomplete_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateBeerController();
			string q = "nas";
			int eventId = 1;

			// Act
			var result = unitUnderTest.CityAutocomplete(
				q,
				eventId);

			// Assert
			Assert.Fail();
		}
	}
}
