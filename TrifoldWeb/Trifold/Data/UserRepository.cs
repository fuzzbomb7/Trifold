using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
	public class UserRepository : IUserRepository
	{
		public ApplicationDbContext Context { get; private set; }
		private readonly ILogger _logger;

		public UserRepository(ApplicationDbContext context, ILogger<UserRepository> logger)
		{
			Context = context;
			_logger = logger;
		}

		public List<Events> GetUpcomingEvents(int eventPromoterId)
		{
			try
			{
				return Context.Events.Include(x => x.Modules).Where(x => x.EventPromoterId == eventPromoterId && x.EventEndTime >= DateTime.Now).OrderBy(x => x.EventStartTime).ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting upcoming events. EventPromoterId: {id}", eventPromoterId);
				return new List<Events>();
			}
		}

		public List<Events> GetPreviousEvents(int eventPromoterId)
		{
			try
			{
				return Context.Events.Include(x => x.Modules).Where(x => x.EventPromoterId == eventPromoterId && x.EventEndTime < DateTime.Now).OrderByDescending(x => x.EventStartTime).ToList();
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting previous events. EventPromoterId: {id}", eventPromoterId);
				return new List<Events>();
			}
		}

	}
}
