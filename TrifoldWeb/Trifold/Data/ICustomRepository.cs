using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
    public interface ICustomRepository : IRepository
    {
        CustomContent GetCustomContent(int eventId);
        bool SaveUrl(int eventId, string url);
        bool SaveHtmlContent(int eventId, string html);
    }
}
