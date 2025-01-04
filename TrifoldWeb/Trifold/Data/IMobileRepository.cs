using System;
using System.Collections.Generic;
using Trifold.Models;

namespace Trifold.Data
{
	public interface IMobileRepository : IRepository
	{
		List<Beers> GetBeersWithLocations(int eventId);
		DateTime? GetLastUpdated(int eventId);
		bool SetLastUpdated(int eventId, DateTime? lastUpdated);
		bool AddEventLogoFile(string path, int eventId);
		//bool AddAppLogoFile(string path, int appId);
        //bool AddAppIconFile(string path, int appId);
        //bool SaveAppConfig(int appId, string title, string color, string contrast, string secondaryColor);
		bool SaveEventConfig(int eventId, string color, string contrast, string secondaryColor, bool addToProst);
        bool SetClean(int eventId);
        string GetPromoUrl(int eventId);
        string SetPromoUrl(int eventId, string promoUrl);
        //AppStoreUrlModel GetAppUrls(int eventId);
        //bool SetAppUrls(int eventId, string googlePlayUrl, string appStoreUrl);
        Engagement GetEngagementData(int eventId);
        bool SetEngagementData(Engagement data);
        //Ticketing GetTicketingData(int eventId);
        //bool SetTicketingData(Ticketing data);
    }
}