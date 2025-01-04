
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Trifold.Services;

namespace TrifoldTest.IntegrationTests.Services
{
    [TestFixture]
    public class StorageServiceTests
    {
        Mock<ILogger<StorageService>> logger;
        Mock<IConfiguration> configuration;
        StorageService service;

        string connectionString = "";

        [SetUp]
        public void SetUp()
        {
            logger = new Mock<ILogger<StorageService>>();
            configuration = new Mock<IConfiguration>();
            service = new StorageService(logger.Object, configuration.Object, connectionString);
        }

        [Test]
        public void UploadFileTest()
        {
            string filePath = Path.Combine(AppContext.BaseDirectory, "upload-test.png");
            FileStream file = new FileStream(filePath, FileMode.Open);
            string url = service.UploadFile("app-icon", "upload-test.png", file);
            Assert.IsNotNull(url);
            DeleteFile(url);
        }

        [Test]
        public void DeleteFile(string uri)
        {
            bool del = service.DeleteFile(uri);
            Assert.IsTrue(del);
        }
    }
}
