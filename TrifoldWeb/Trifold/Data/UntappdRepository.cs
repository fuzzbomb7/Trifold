using System;
using System.Linq;
using Trifold.Models;
using Microsoft.Extensions.Logging;

namespace Trifold.Data
{
	public class UntappdRepository : IUntappdRepository
	{
		public ApplicationDbContext Context { get; private set; }
		private ILogger _logger;

		public UntappdRepository(ApplicationDbContext context, ILogger<MobileRepository> logger)
		{
			Context = context;
			_logger = logger;
		}

		public string GetToken(string deviceId)
		{
			try
			{
				var getToken = Context.MobileTokens.Where(x => x.DeviceId == deviceId).FirstOrDefault();
				if (getToken != null) return getToken.Token;
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error getting mobile token, DeviceId: {deviceId}", deviceId);
			}
			return null;
		}

		public bool SetToken(string deviceId, string token)
		{
			try
			{
				var addToken = new MobileTokens()
				{
					AddDate = DateTime.Now,
					DeviceId = deviceId,
					Token = token
				};

				Context.MobileTokens.Add(addToken);
				Context.SaveChanges();

				return true;
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error setting mobile token, DeviceId: {deviceId}, Token: {token}", deviceId, token);
				return false;
			}
		}

		public EventLocationModel GetEventLocationInfo(int eventId)
		{
			var model = new EventLocationModel();

			try
			{
				var getEvent = Context.Events.Find(eventId);

				if(getEvent != null)
				{
					model.FoursquareId = getEvent.FoursquareId;
					model.Latitude = getEvent.Latitude;
					model.Longitude = getEvent.Longitude;
					model.TimeZone = getEvent.TimeZone;
				}
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error getting event location info. EventId: {eventId}", eventId);
			}

			return model;
		}

	}
}
