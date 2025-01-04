using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Services
{
	public interface IUntappdApi
	{
		Task<UntappdAuthResult> AuthorizeAsync(string code);
		Task<UntappdSearchResponseModel> SearchAsync(string search, int offset = 0, int limit = 25, string accessToken = null);
		Task<UntappdCheckinResult> CheckinAsync(string accessToken, int beerId, double rating, string shout, string gmtOffset, string timeZone, double latitude = 0, double longitude = 0, string foursquareId = null);
        Task<UntappdSearchResponseModel> GetUserAsync(string accessToken);
    }
}