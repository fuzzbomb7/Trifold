using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
	public interface IUserRepository : IRepository
	{
		List<Events> GetPreviousEvents(int eventPromoterId);
		List<Events> GetUpcomingEvents(int eventPromoterId);
	}
}