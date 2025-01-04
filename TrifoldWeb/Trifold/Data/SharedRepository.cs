using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
    public class SharedRepository : ISharedRepository
    {
        public ApplicationDbContext Context { get; private set; }

        private ILogger logger;

        public SharedRepository(ApplicationDbContext context, ILogger<SharedRepository> logger)
        {
            Context = context;
            this.logger = logger;
        }

        public bool SetDirty(ISession session, int eventId)
        {
            try
            {
                var dirtyEvent = Context.Events.Find(eventId);
                dirtyEvent.IsDirty = true;
                Context.SaveChanges();
                session.SetInt32("DirtyData", 1);
                return true;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error setting dirty flag. EventId: {eventId}", eventId);
                return false;
            }
        }

        
        public Events GetEvent(int eventId)
        {
            try
            {
                return Context.Events
                    .Include(x => x.Modules)
                    .Include(x => x.Map)
                    .Include(x => x.CustomContent)
                    .Include(x => x.Engagement)
                    .Include(x => x.EventPromoter)
                    .Include(x => x.Promotion)
                    .Where(x => x.Id == eventId).FirstOrDefault();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting event, EventId: {eventId}", eventId);
                return new Events();
            }
        }

        public EventPromoters GetEventPromoter(int id)
        {
            try
            {
                return Context.EventPromoters.Where(x => x.Id == id).FirstOrDefault();
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error getting event promoter, Id: {id}", id);
                return new EventPromoters();
            }

        }

        public Maps GetMap(int eventId)
        {
            try
            {
                return Context.Maps.Where(x => x.EventId == eventId).FirstOrDefault();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting map. EventId: {eventId},", eventId);
                return new Maps();
            }
        }

        
        public List<ModuleEnum> GetModules(int eventId)
        {
            try
            {
                return Context.Modules.Where(x => x.EventId == eventId).Select(x => x.ModuleId).ToList();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting modules. EventId: {eventId},", eventId);
                return new List<ModuleEnum>();
            }
        }


        public bool CheckValidAppId(string appId)
        {
            throw new NotImplementedException();
        }

        public string GetCDNLink(string url)
        {
            if (url == null) return null;

            try
            {
                var blobUrl = new Uri(url);
                string relativeUrl = blobUrl.AbsolutePath;
                var cdnUrl = new Uri(new Uri("https://trifold-cdn.azureedge.net"), new Uri(relativeUrl, UriKind.Relative));
                return cdnUrl.ToString();
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error getting CDN link. URL: {url},", url);
                return url;
            }
        }
    }
}
