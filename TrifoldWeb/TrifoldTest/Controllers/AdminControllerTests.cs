using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Controllers;
using Trifold.Data;
using Trifold.Models;

namespace TrifoldTest.Controllers
{
	[TestFixture]
	public class AdminControllerTests
	{
		private MockRepository mockRepository;

		private Mock<IAdminRepository> mockAdminRepository;
		private Mock<UserManager<ApplicationUser>> mockUserManager;
		private Mock<ILogger<AdminController>> mockLogger;

		private EventPromoters promoter;
		private Events addevent;
		private NewUser newUser;

		[SetUp]
		public void SetUp()
		{
			this.mockRepository = new MockRepository(MockBehavior.Strict) { CallBase = true };

			this.mockAdminRepository = this.mockRepository.Create<IAdminRepository>();

			var userStore = new Mock<IUserStore<ApplicationUser>>();
			this.mockUserManager = new Mock<UserManager<ApplicationUser>>(userStore.Object, null, null, null, null, null, null, null, null);
			this.mockLogger = new Mock<ILogger<AdminController>>();

			promoter = new EventPromoters()
			{
				CompanyName = "Test",
				ContactEmail = "test@email.com",
				Website = "http://www.test.com"
			};

			addevent = new Events()
			{
				EventAddress = "123 Main St",
				EventCity = "Nashville",
				EventEndTime = DateTime.Now,
				EventName = "Cool Festival",
				EventPromoterId = 1,
				EventStartTime = DateTime.Today,
				EventState = "TN",
				EventUrl = "http://www.test.com",
				EventZip = "12345"
			};

			newUser = new NewUser()
			{
				EventPromoterId = 1,
				Password = "Gg45&*dgdfg",
				UserName = "test@email.com"
			};

		}

		[TearDown]
		public void TearDown()
		{
			this.mockRepository.VerifyAll();
		}

		private AdminController CreateAdminController()
		{
			return new AdminController(
				this.mockAdminRepository.Object,
				this.mockUserManager.Object,
				this.mockLogger.Object);
		}

		[Test]
		public void Index_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();

			// Act
			var result = unitUnderTest.Index();

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void Promoters_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			this.mockAdminRepository.Setup(x => x.GetEventPromoters()).Returns(new List<EventPromoters>() { promoter });

			// Act
			var result = unitUnderTest.Promoters();

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void PromotersAdd_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();

			// Act
			var result = unitUnderTest.PromotersAdd();

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void PromotersAdd_StateUnderTest_ExpectedBehavior1()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			mockAdminRepository.Setup(x => x.AddEventPromoter(promoter)).Returns(1);

			// Act
			var result = unitUnderTest.PromotersAdd(promoter);

			// Assert
			Assert.IsInstanceOf<RedirectToActionResult>(result);
		}

		[Test]
		public void PromotersEdit_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			int id = 1;
			mockAdminRepository.Setup(x => x.GetEventPromoter(id)).Returns(promoter);

			// Act
			var result = unitUnderTest.PromotersEdit(id);

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void PromotersEdit_StateUnderTest_ExpectedBehavior1()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			mockAdminRepository.Setup(x => x.UpdateEventPromoter(promoter)).Returns(1);

			// Act
			var result = unitUnderTest.PromotersEdit(promoter);

			// Assert
			Assert.IsInstanceOf<RedirectToActionResult>(result);
		}

		[Test]
		public void Events_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			mockAdminRepository.Setup(x => x.GetEvents()).Returns(new List<Events>() { addevent });

			// Act
			var result = unitUnderTest.Events();

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void EventsAdd_StateUnderTest_ExpectedBehavior()
		{ 
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			mockAdminRepository.Setup(x => x.GetEventPromoterSelectList()).Returns(new List<SelectListItem>());

			// Act
			var result = unitUnderTest.EventsAdd();

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void EventsAdd_StateUnderTest_ExpectedBehavior1()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			mockAdminRepository.Setup(x => x.AddEvent(addevent)).Returns(1);

			// Act
			var result = unitUnderTest.EventsAdd(addevent);

			// Assert
			Assert.IsInstanceOf<RedirectToActionResult>(result);
		}

		[Test]
		public void EventsEdit_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			int id = 1;
			mockAdminRepository.Setup(x => x.GetEventPromoterSelectList()).Returns(new List<SelectListItem>());
			mockAdminRepository.Setup(x => x.GetEvent(id)).Returns(addevent);

			// Act
			var result = unitUnderTest.EventsEdit(id);

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void EventsEdit_StateUnderTest_ExpectedBehavior1()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			mockAdminRepository.Setup(x => x.UpdateEvent(addevent)).Returns(1);

			// Act
			var result = unitUnderTest.EventsEdit(addevent);

			// Assert
			Assert.IsInstanceOf<RedirectToActionResult>(result);
		}

		[Test]
		public void Users_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();

			// Act
			var result = unitUnderTest.Users();

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		[Test]
		public void UsersAdd_StateUnderTest_ExpectedBehavior()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			mockAdminRepository.Setup(x => x.GetEventPromoterSelectList()).Returns(new List<SelectListItem>());

			// Act
			var result = unitUnderTest.UsersAdd();

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}

		/*[Test]
		public void UsersAdd_StateUnderTest_ExpectedBehavior1()
		{
			// Arrange
			var unitUnderTest = this.CreateAdminController();
			var user = new ApplicationUser() { UserName = newUser.UserName, Email = newUser.UserName, EventPromoterId = newUser.EventPromoterId == 0 ? null : newUser.EventPromoterId };

			var mockIdentityResult = ;


			mockUserManager.Setup(y => y.CreateAsync(user, newUser.Password).Result)

			// Act
			var result = unitUnderTest.UsersAdd(newUser);

			// Assert
			Assert.IsInstanceOf<ViewResult>(result);
		}*/
	}
}
