using System.Collections.Generic;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Services
{
    public interface IFoursquareApi
    {
        Task<List<FoursquareVenueSearchResult>> SearchAsync(string location, string query);
    }
}