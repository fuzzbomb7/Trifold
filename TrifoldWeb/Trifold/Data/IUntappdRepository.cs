using Trifold.Models;

namespace Trifold.Data
{
	public interface IUntappdRepository : IRepository
	{
		string GetToken(string deviceId);
		bool SetToken(string deviceId, string token);
		EventLocationModel GetEventLocationInfo(int eventId);
	}
}