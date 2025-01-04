using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Trifold.Models;
using Microsoft.Extensions.Logging;

namespace Trifold.Data
{
	public class MobileRepository : IMobileRepository
	{
		public ApplicationDbContext Context { get; private set; }
		private ILogger _logger;

		public MobileRepository(ApplicationDbContext context, ILogger<MobileRepository> logger)
		{
			Context = context;
			_logger = logger;
		}

		public List<Beers> GetBeersWithLocations(int eventId)
		{
			try
			{
				return Context.Beers.Include(x => x.Location).Include(x => x.Brewery).Where(x => x.EventId == eventId).ToList();
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error getting beer list with locations, EventId: {eventId}", eventId);
				return new List<Beers>();
			}
		}

		public DateTime? GetLastUpdated(int eventId)
		{
			try
			{
				return Context.Events.Find(eventId).LastUpdated;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error getting last updated date. EventId: {eventId},", eventId);
				return null;
			}
		}

		public bool SetLastUpdated(int eventId, DateTime? lastUpdated)
		{
			try
			{
				var getEvent = Context.Events.Find(eventId);
				getEvent.LastUpdated = lastUpdated;
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error setting last updated date. EventId: {eventId}, Last Updated: {lastUpdated}", eventId, lastUpdated);
				return false;
			}
		}

		public bool AddEventLogoFile(string path, int eventId)
		{
			try
			{
				var getEvent = Context.Events.Find(eventId);
				getEvent.EventImageUrl = path;
				Context.SaveChanges();
				return true;
			}
			catch (Exception ex)
			{
				_logger.LogError(ex, "Error setting logo file path. EventId: {eventId}, Path: {path}", eventId, path);
				return false;
			}
		}

		//public bool AddAppLogoFile(string path, int appId)
		//{
		//	try
		//	{
		//		var app = Context.Apps.Find(appId);
		//		app.SplashImageUrl = path;
		//		Context.SaveChanges();
		//		return true;
		//	}
		//	catch (Exception ex)
		//	{
		//		_logger.LogError(ex, "Error setting logo file path. AppId: {appId}, Path: {path}", appId, path);
		//		return false;
		//	}
		//}

		//public bool SaveAppConfig(int appId, string title, string color, string contrast, string secondaryColor)
		//{
		//	try
		//	{
		//		var app = Context.Apps.Find(appId);
		//		app.AppName = title;
		//		app.PrimaryColor = color;
  //              app.TextContrast = contrast == "dark" ? TextContrastEnum.Dark : TextContrastEnum.Light;
  //              app.SecondaryColor = secondaryColor;
  //              Context.SaveChanges();
		//		return true;
		//	}
		//	catch(Exception e)
		//	{
		//		_logger.LogError(e, "Error saving app config. Id: {appId}, Title: {title}, Color: {color}", appId, title, color);
		//		return false;
		//	}
		//}

		public bool SaveEventConfig(int eventId, string color, string contrast, string secondaryColor, bool addToProst)
		{
			try
			{
				var getEvent = Context.Events.Find(eventId);
				getEvent.EventPrimaryColor = color;
				//getEvent.AddToProst = addToProst;
                getEvent.EventTextContrast = contrast == "dark" ? TextContrastEnum.Dark : TextContrastEnum.Light;
                getEvent.EventSecondaryColor = secondaryColor;
                Context.SaveChanges();
				return true;
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error saving event config. EventId: {eventId}, Color: {color}, Prost: {addToProst}", eventId, color, addToProst);
				return false;
			}
		}

        public bool SetClean(int eventId)
        {
            try
            {
                var cleanEvent = Context.Events.Find(eventId);
                cleanEvent.IsDirty = false;
                Context.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error unsetting dirty flag. EventId: {eventId}", eventId);
                return false;
            }
        }

        //public bool AddAppIconFile(string path, int appId)
        //{
        //    try
        //    {
        //        var app = Context.Apps.Find(appId);
        //        app.AppIconUrl = path;
        //        Context.SaveChanges();
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error setting icon file path. AppId: {appId}, Path: {path}", appId, path);
        //        return false;
        //    }
        //}

        public string GetPromoUrl(int eventId)
        {
            try
            {
                return Context.PromoLinks.Where(x => x.EventId == eventId).FirstOrDefault()?.PromoUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting promo url. EventId: {eventId}", eventId);
                return null;
            }
        }

        public string SetPromoUrl(int eventId, string promoUrl)
        {
            try
            {
                promoUrl = promoUrl.ToLower().Trim();
                bool urlExists = Context.PromoLinks.Where(x => x.PromoUrl == promoUrl && x.EventId != eventId).Any();
                if (urlExists) return null;

                var promo = new PromoLinks();
                promo.EventId = eventId;
                promo.PromoUrl = promoUrl;
                Context.PromoLinks.Add(promo);
                Context.SaveChanges();
                return promoUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating new promo url. EventId: {eventId}, Link: {promoUrl}", eventId, promoUrl);
                return null;
            }
        }

        /*public AppStoreUrlModel GetAppUrls(int eventId)
        {
            try
            {
                var getEvent = Context.Events.Include(x => x.EventPromoter).ThenInclude(x => x.App).Where(x => x.Id == eventId).FirstOrDefault();
                var urls = new AppStoreUrlModel();
                urls.AppStoreUrl = getEvent.EventPromoter.App.iOSAppStoreUrl;
                urls.GooglePlayUrl = getEvent.EventPromoter.App.AndroidAppStoreUrl;
                return urls;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting app store urls. EventId: {eventId}", eventId);
                return new AppStoreUrlModel();
            }
        }

        public bool SetAppUrls(int eventId, string googlePlayUrl, string appStoreUrl)
        {
            try
            {
                var getEvent = Context.Events.Include(x => x.EventPromoter).ThenInclude(x => x.App).Where(x => x.Id == eventId).FirstOrDefault();
                getEvent.EventPromoter.App.AndroidAppStoreUrl = googlePlayUrl;
                getEvent.EventPromoter.App.iOSAppStoreUrl = appStoreUrl;
                Context.SaveChanges();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting app store urls. EventId: {eventId}", eventId);
                return false;
            }
        }*/

        public Engagement GetEngagementData(int eventId)
        {
            try
            {
                return Context.Engagement.Where(x => x.EventId == eventId).FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting engagement data. EventId: {eventId}", eventId);
                return new Engagement();
            }
        }

        public bool SetEngagementData(Engagement data)
        {
            try
            {
                var engagement = Context.Engagement.Where(x => x.EventId == data.EventId).FirstOrDefault();

                if (engagement != null)
                {
                    engagement.EmailUrl = data.EmailUrl;
                    engagement.FacebookUrl = data.FacebookUrl;
                    engagement.FBID = data.FBID;
                    engagement.InstagramUrl = data.InstagramUrl;
                    engagement.TwitterUrl = data.TwitterUrl;
                }
                else
                {
                    Context.Engagement.Add(data);
                }
                Context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting engagement data. {data}", data);
                return false;
            }
        }

        //public Ticketing GetTicketingData(int eventId)
        //{
        //    try
        //    {
        //        return Context.Ticketing.Where(x => x.EventId == eventId).FirstOrDefault();
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error getting ticketing data. EventId: {eventId}", eventId);
        //        return new Ticketing();
        //    }
        //}

        //public bool SetTicketingData(Ticketing data)
        //{
        //    try
        //    {
        //        var ticket = Context.Ticketing.Where(x => x.EventId == data.EventId).FirstOrDefault();

        //        if (ticket != null)
        //        {
        //            ticket.EndDate = data.EndDate;
        //            ticket.SoldOut = data.SoldOut;
        //            ticket.StartDate = data.StartDate;
        //            ticket.TicketUrl = data.TicketUrl;
        //        }
        //        else
        //        {
        //            Context.Ticketing.Add(data);
        //        }

        //        Context.SaveChanges();
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error setting ticketing data. {data}", data);
        //        return false;
        //    }
        //}
    }
}
