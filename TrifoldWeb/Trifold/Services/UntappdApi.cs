using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Trifold.Models;
using System.Net.Http.Headers;

namespace Trifold.Services
{
	public class UntappdApi : IUntappdApi
	{
		private IHttpClient _client;
		private IConfiguration _configuration;
		private ILogger _logger;

		public UntappdApi(IHttpClient client, IConfiguration configuration, ILogger<UntappdApi> logger)
		{
			_client = client;
			_configuration = configuration;
			_logger = logger;

			// Add user agent
			if(_client.DefaultRequestHeaders.UserAgent.Count == 0) _client.DefaultRequestHeaders.UserAgent.ParseAdd($"Prost ({_configuration["UntappdApiKey"]})");
		}

		/// <summary>
		/// Authorize Untappd user
		/// </summary>
		/// <param name="code">Code returned from authenticate endpoint</param>
		/// <returns></returns>
		public async Task<UntappdAuthResult> AuthorizeAsync(string code)
		{
			var url = QueryHelpers.AddQueryString("https://untappd.com/oauth/authorize/", new Dictionary<string, string>()
			{
				{ "client_id", _configuration["UntappdApiKey"] },
				{ "client_secret", _configuration["UntappdApiSecret"] },
				{ "redirect_url", _configuration["UntappdApiRedirectUrl"] },
				{ "response_type", "code" },
				{ "code", code }
			});

			var result = new UntappdAuthResult();
			string returnJson = null;

			try
			{
				var response = await _client.GetAsync(url);

				returnJson = await response.Content.ReadAsStringAsync();
				var responseObject = JsonConvert.DeserializeObject<UntappdSearchResponseModel>(returnJson);

				if (!string.IsNullOrWhiteSpace(responseObject.response.access_token))
				{
					result.Success = true;
					result.AccessToken = responseObject.response.access_token;
				}
				else
				{
					result.Success = false;
					result.Error = responseObject.meta.developer_friendly ?? responseObject.meta.developer_friendly;
				}
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error authorizing Untappd user. Url: {url}, Response: {json}", url, returnJson);
				result.Success = false;
				result.Error = e.Message;
			}

			return result;
		}

		/// <summary>
		/// Search for beers
		/// </summary>
		/// <param name="search">Search term</param>
		/// <param name="offset">Search result offset (default 0)</param>
		/// <param name="limit">Results to return (default 25, max 50)</param>
		/// <param name="accessToken">User's API access token (optional)</param>
		/// <returns></returns>
		public async Task<UntappdSearchResponseModel> SearchAsync(string search, int offset = 0, int limit = 25, string accessToken = null)
		{
			var url = QueryHelpers.AddQueryString("https://api.untappd.com/v4/search/beer", new Dictionary<string, string>()
			{
				{ "q", search },
				{ "offset", offset.ToString() },
				{ "limit", limit.ToString() }
			});

			if(!string.IsNullOrWhiteSpace(accessToken))
			{
				url = QueryHelpers.AddQueryString(url, "access_token", accessToken);
			}
			else
			{
				url = QueryHelpers.AddQueryString(url, new Dictionary<string, string>()
				{
					{ "client_id", _configuration["UntappdApiKey"] },
					{ "client_secret", _configuration["UntappdApiSecret"] }
				});
			}

			string returnJson = null;

			try
			{
				var response = await _client.GetAsync(url);

				returnJson = await response.Content.ReadAsStringAsync();
				return JsonConvert.DeserializeObject<UntappdSearchResponseModel>(returnJson);
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error searching Untappd. Url: {url}, Response: {json}", url, returnJson);
				Meta meta = new Meta();
				meta.error_detail = e.Message;
				return new UntappdSearchResponseModel() { meta = meta };
			}
		}

		/// <summary>
		/// Check beer into Untappd
		/// </summary>
		/// <param name="accessToken"></param>
		/// <param name="beerId"></param>
		/// <param name="rating"></param>
		/// <param name="shout"></param>
		/// <param name="gmtOffset"></param>
		/// <param name="timeZone"></param>
		/// <param name="latitude"></param>
		/// <param name="longitude"></param>
		/// <param name="foursquareId"></param>
		/// <returns></returns>
		public async Task<UntappdCheckinResult> CheckinAsync(string accessToken, int beerId, double rating, string shout, string gmtOffset, string timeZone, double latitude = 0, double longitude = 0, string foursquareId = null)
		{
			var parameters = new List<KeyValuePair<string, string>>();
			parameters.Add(new KeyValuePair<string, string>("access_token", accessToken));
			parameters.Add(new KeyValuePair<string, string>("bid", beerId.ToString()));
			parameters.Add(new KeyValuePair<string, string>("gmt_offset", gmtOffset));
			parameters.Add(new KeyValuePair<string, string>("rating", rating.ToString()));
			parameters.Add(new KeyValuePair<string, string>("shout", shout));
			parameters.Add(new KeyValuePair<string, string>("timezone", timeZone));

			if (foursquareId != null && latitude != 0 && longitude != 0)
			{
				parameters.Add(new KeyValuePair<string, string>("foursquare_id", foursquareId));
				parameters.Add(new KeyValuePair<string, string>("geolng", longitude.ToString()));
				parameters.Add(new KeyValuePair<string, string>("geolat", latitude.ToString()));
			}

			string url = QueryHelpers.AddQueryString("https://api.untappd.com/v4/checkin/add", new Dictionary<string, string>()
			{
				{ "client_id", _configuration["UntappdApiKey"] },
				{ "access_token", accessToken }
			});

			var result = new UntappdCheckinResult();
			string returnJson = string.Empty;

			try
			{
				var content = new FormUrlEncodedContent(parameters);
				var response = await _client.PostAsync(url, content);
				returnJson = await response.Content.ReadAsStringAsync();
				var responseObject = JsonConvert.DeserializeObject<UntappdCheckinResponseModel>(returnJson);
				
				result.Success = responseObject.meta.code == 200 ? true : false;
				result.Error = responseObject.meta.developer_friendly ?? responseObject.meta.error_detail;

				if (result.Success == false)
				{
					_logger.LogWarning("Server error checking into Untappd. Url: {url}, Response: {json}, BeerId: {bid}, GMT Offset: {gmt_offset}, Timezone: {timeZone}," +
						" Rating: {rating}, Shout: {shout}, Lat: {latitude}, Lon: {longitude}, fourSquareId: {foursquareId}", url, returnJson, beerId, gmtOffset, timeZone, rating, shout, latitude, longitude, foursquareId);
				}
			}
			catch (Exception e)
			{
				_logger.LogError(e, "Error checking into Untappd. Url: {url}, Response: {json}, BeerId: {bid}, GMT Offset: {gmt_offset}, Timezone: {timeZone}," +
						" Rating: {rating}, Shout: {shout}, Lat: {latitude}, Lon: {longitude}, fourSquareId: {foursquareId}", url, returnJson, beerId, gmtOffset, timeZone, rating, shout, latitude, longitude, foursquareId);
			}

			return result;
		}

        public async Task<UntappdSearchResponseModel> GetUserAsync(string accessToken)
        {
            var url = QueryHelpers.AddQueryString("https://api.untappd.com/v4/user/info", new Dictionary<string, string>()
            {
                { "access_token", accessToken },
                { "compact", "true" }
            });

            string returnJson = null;

            try
            {
                var response = await _client.GetAsync(url);

                returnJson = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<UntappdSearchResponseModel>(returnJson);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error getting user data from Untappd. Url: {url}, Response: {json}", url, returnJson);
                Meta meta = new Meta();
                meta.error_detail = e.Message;
                return new UntappdSearchResponseModel() { meta = meta };
            }
        }
	}
}
