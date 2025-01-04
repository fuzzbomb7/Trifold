using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;
using Trifold.Services;

namespace TrifoldTest.IntegrationTests.Services
{
    [TestFixture]
    public class FoursquareApiTests
    {
        Mock<ILogger<FoursquareApi>> logger;
        FoursquareApi service;
        IConfiguration config;

        [SetUp]
        public void SetUp()
        {
            var configBuilder = new ConfigurationBuilder();
            config = configBuilder.AddJsonFile("secrets.json").Build();

            logger = new Mock<ILogger<FoursquareApi>>();
            service = new FoursquareApi(new HttpClientService(), config, logger.Object);
        }

        [Test]
        public async System.Threading.Tasks.Task SearchVenueAsync()
        {
            var result = await service.SearchAsync("Nashville, TN", "East Park");
            Assert.AreEqual(result[0].Id, "4c16dc13955976b0e244a5f6");
        }


    }
}
