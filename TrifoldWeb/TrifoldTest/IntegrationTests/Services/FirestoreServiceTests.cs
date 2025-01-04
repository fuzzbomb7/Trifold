using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;
using Trifold.Models.Firestore;
using Trifold.Services;

namespace TrifoldTest.IntegrationTests.Services
{
	[TestFixture]
	public class FirestoreServiceTests
	{
		Mock<ILogger<FirestoreService>> logger;
		FirestoreService service;
        Events eventData;
        Mock<ISharedRepository> shared;

		[SetUp]
		public void SetUp()
		{
			logger = new Mock<ILogger<FirestoreService>>();
            shared = new Mock<ISharedRepository>();
			service = new FirestoreService(logger.Object, shared.Object);

            eventData = new Events();

            eventData.EventAddress = "123 Main St";
            eventData.EventCity = "Nashville";
            eventData.EventEndTime = new DateTime(2020, 4, 20, 18, 0, 0);
            eventData.EventImageUrl = "logo.png";
            eventData.EventName = "Test Beer Fest";
            eventData.EventPrimaryColor = "#ffffff";
            eventData.EventPromoterId = 1;
            eventData.EventStartTime = new DateTime(2020, 4, 20, 12, 0, 0);
            eventData.EventState = "TN";
            eventData.EventUrl = "https://trifold.app";
            eventData.EventZip = "37203";
            eventData.Id = 1;
            eventData.Latitude = 36.17287193505297;
            eventData.Longitude = -86.76032066345215;
            eventData.Modules = new List<Modules>() { new Modules() { ModuleId = ModuleEnum.Beer } };
            eventData.TimeZone = "CST";
            eventData.Map = new Maps() { MapPath = "map.png" };
            eventData.FoursquareId = "4c16dc13955976b0e244a5f6";
        }

		[Test]
		public async Task WriteEventAndBeverageDataTest()
		{
            var beers = new List<Beers>();

            beers.Add(new Beers
			{
				Abv = 5,
				BeerName = "Pale Ale",
				Description = "A classic pale ale",
				Ibu = 50,
				Id = 1,
				LabelUrl = null,
				LocationId = 1,
				Style = "Pale Ale",
				UntappdBeerId = 123,
				Location = new Locations
				{
					Latitude = 50,
					Longitude = 50,
				},
				Brewery = new Breweries
				{
					BreweryCity = "Chico, CA",
					BreweryName = "Sierra Nevada",
				}
			});

            beers.Add(new Beers
			{
				Abv = 6.2,
				BeerName = "IPA",
				Description = "A classic IPA",
				Ibu = 50,
				Id = 2,
				LabelUrl = null,
				LocationId = 2,
				Style = "IPAe",
				UntappdBeerId = 1234,
				Location = new Locations
				{
					Latitude = 150,
					Longitude = 150,
				},
				Brewery = new Breweries
				{
					BreweryCity = "Chico, CA",
					BreweryName = "Lagunitas",
				}
			});

            beers.Add(new Beers
			{
				Abv = 7.3,
				BeerName = "Big Beer",
				Description = "A classic pale ale",
				Ibu = 50,
				Id = 3,
				LabelUrl = null,
				LocationId = 3,
				Style = "Pale Ale",
				UntappdBeerId = 1235,
				Location = new Locations
				{
					Latitude = 250,
					Longitude = 250,
				},
				Brewery = new Breweries
				{
					BreweryCity = "Chico, CA",
					BreweryName = "Sierra Nevada",
				}
			});

           

            var result = await service.WriteEventAndBeverageData(eventData, beers);
			Assert.IsNotNull(result);
		}

		
        [Test]
        public async Task WriteEventDataTest()
        {
            bool result = await service.WriteEventData(eventData);
            Assert.True(result);
        }

        //[Test]
        //public async Task WriteAppDataTest()
        //{
        //    var list = new List<Events>() { eventData };
        //    bool result = await service.WriteAppData("test-guid", list);
        //    Assert.True(result);
        //}

	}
}
