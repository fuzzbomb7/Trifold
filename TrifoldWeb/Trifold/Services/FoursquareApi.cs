using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Services
{
    public class FoursquareApi : IFoursquareApi
    {
        private readonly IHttpClient client;
        private readonly IConfiguration configuration;
        private readonly ILogger<FoursquareApi> logger;

        public FoursquareApi(IHttpClient client, IConfiguration configuration, ILogger<FoursquareApi> logger)
        {
            this.client = client;
            this.configuration = configuration;
            this.logger = logger;
        }

        public async Task<List<FoursquareVenueSearchResult>> SearchAsync(string location, string query)
        {
            string apiDate = new DateTime(2019, 4, 1).ToString("yyyyMMdd");

            var url = QueryHelpers.AddQueryString("https://api.foursquare.com/v2/venues/search", new Dictionary<string, string>()
            {
                { "client_id", configuration["FoursquareApiKey"] },
                { "client_secret", configuration["FoursquareApiSecret"] },
                { "near", location },
                { "query", query },
                { "v", apiDate },
                { "limit", "5" }
            });

            var result = new List<FoursquareVenueSearchResult>();
            string returnJson = null;

            try
            {
                var response = await client.GetAsync(url);

                returnJson = await response.Content.ReadAsStringAsync();
                var responseObject = JsonConvert.DeserializeObject<Models.Foursquare.VenueSearchResult>(returnJson);

                foreach (var loc in responseObject.response.venues)
                {
                    var addResult = new FoursquareVenueSearchResult();
                    addResult.Address = string.Join(", ", loc.location.formattedAddress);
                    addResult.Id = loc.id;
                    addResult.Latitude = loc.location.lat;
                    addResult.Longitude = loc.location.lng;
                    addResult.Name = loc.name;

                    result.Add(addResult);
                }
            }
            catch (Exception e)
            {
                logger.LogError(e, "Error searching Foursquare for venues. Loc: {location}, Query: {query}", location, query);
            }

            return result;
        }
    }
}
