using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
    public class CustomRepository : ICustomRepository
    {
        private readonly ILogger<CustomRepository> logger;

        public ApplicationDbContext Context { get; set; }

        public CustomRepository(ApplicationDbContext context, ILogger<CustomRepository> logger)
        {
            Context = context;
            this.logger = logger;
        }

        public CustomContent GetCustomContent(int eventId)
        {
            try
            {
                return Context.CustomContent.Where(x => x.EventId == eventId).FirstOrDefault();
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error getting custom content. EventId: {eventId}", eventId);
                return new CustomContent();
            }
        }

        public bool SaveUrl(int eventId, string url)
        {
            try
            {
                var content = Context.CustomContent.Where(x => x.EventId == eventId).FirstOrDefault();
                if (content == null) content = NewCustomContent(eventId);
                content.Url = url;
                content.HtmlContent = string.Empty;
                Context.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error saving custom content Url. EventId: {eventId}", eventId);
                return false;
            }
        }

        public bool SaveHtmlContent(int eventId, string html)
        {
            try
            {
                var content = Context.CustomContent.Where(x => x.EventId == eventId).FirstOrDefault();
                if (content == null) content = NewCustomContent(eventId);
                content.Url = string.Empty;
                content.HtmlContent = html;
                Context.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error saving custom content Html. EventId: {eventId}", eventId);
                return false;
            }
        }

        private CustomContent NewCustomContent(int eventId)
        {
            try
            {
                var content = new CustomContent();
                content.EventId = eventId;
                Context.CustomContent.Add(content);
                return content;
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error adding new custom content. EventId: {eventId}", eventId);
                return new CustomContent();
            }
        }

    }
}
