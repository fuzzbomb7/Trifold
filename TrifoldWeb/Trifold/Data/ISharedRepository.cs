using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Trifold.Models;

namespace Trifold.Data
{
    public interface ISharedRepository : IRepository
    {
        bool SetDirty(ISession session, int eventId);
        //string GetApplicationGuid(int id);
        //List<Events> GetWhiteLabelProstEvents(int prostAppId);
        //List<Events> GetApplicationEvents(int appId);
        Events GetEvent(int id);
        EventPromoters GetEventPromoter(int id);
        Maps GetMap(int eventId);
        //int? GetApplicationId(int eventPromoterId);
        //int GetWhiteLabelAppId(int eventPromoterId);
        List<ModuleEnum> GetModules(int eventId);
        //Apps GetAppConfiguration(int appId);
        bool CheckValidAppId(string appId);
        string GetCDNLink(string url);
    }
}