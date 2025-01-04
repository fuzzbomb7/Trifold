using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;

namespace Trifold
{
	public class SeedData
	{
		private readonly UserManager<ApplicationUser> userManager;
		private readonly RoleManager<IdentityRole> roleManager;
		private readonly IAdminRepository repository;

		public SeedData(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IAdminRepository repository)
		{
			this.userManager = userManager;
			this.roleManager = roleManager;
			this.repository = repository;
		}

		public void SeedIdentity()
		{
			// Add roles
			if(!roleManager.RoleExistsAsync("Admin").Result)
			{
				var admin = new IdentityRole() { Name = "Admin", NormalizedName = "Admin" };
				roleManager.CreateAsync(admin).Wait();
			}

			if (!roleManager.RoleExistsAsync("User").Result)
			{
				var user = new IdentityRole() { Name = "User", NormalizedName = "User" };
				roleManager.CreateAsync(user).Wait();
			}

			// Add default user(s)
			if (userManager.FindByEmailAsync("andrew@trifold.app").Result == null)
			{
				ApplicationUser user = new ApplicationUser { UserName = "andrew@trifold.app", Email = "andrew@trifold.app" };
				var isAdmin = userManager.CreateAsync(user, "Changethi5%").Result;

				if(isAdmin.Succeeded)
				{
					userManager.AddToRoleAsync(user, "Admin").Wait();
				}
			}

			if (userManager.FindByEmailAsync("testuser@trifold.app").Result == null)
			{
				ApplicationUser user = new ApplicationUser { UserName = "testuser@trifold.app", Email = "testuser@trifold.app" };
				var isAdmin = userManager.CreateAsync(user, "Changethi5%").Result;

				if (isAdmin.Succeeded)
				{
					userManager.AddToRoleAsync(user, "User").Wait();
				}
			}

		}

		public async void SeedTestData()
		{
			var testPromoter = new EventPromoters()
			{
				CompanyName = "Test Promoter",
				ContactEmail = "testuser@trifold.app",
				Website = "https://www.trifold.app"
			};

			var getTestPromoter = repository.Context.EventPromoters.Where(x => x.CompanyName == testPromoter.CompanyName && x.ContactEmail == testPromoter.ContactEmail).FirstOrDefault();

			if(getTestPromoter == null)
			{
				repository.Context.EventPromoters.Add(testPromoter);
				repository.Context.SaveChanges();

				var user = await userManager.FindByEmailAsync("testuser@trifold.app");
				user.EventPromoterId = testPromoter.Id;

				var testEvent = new Events() {
					EventAddress = "MacArthur Park",
					EventCity = "Paradise City",
					EventEndTime = new DateTime(2019, 6, 13, 16, 0, 0),
					EventName = "Test Beer Festival",
					EventPromoterId = testPromoter.Id,
					EventStartTime = new DateTime(2019, 6, 13, 12, 0, 0),
					EventState = "CA",
					EventUrl = "https://www.trifold.app",
					EventZip = "90210",
					IsActive = true,
				};

				testEvent.Modules = new List<Modules>() {
					new Modules(){ EventId = testEvent.Id, ModuleId = ModuleEnum.Beer },
					new Modules(){ EventId = testEvent.Id, ModuleId = ModuleEnum.Map },
					new Modules(){ EventId = testEvent.Id, ModuleId = ModuleEnum.Custom },
				};

				repository.AddEvent(testEvent);
				repository.Context.SaveChanges();
			}
		}
	}
}
