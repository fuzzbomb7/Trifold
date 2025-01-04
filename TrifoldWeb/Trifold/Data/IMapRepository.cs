using System.Collections.Generic;
using Trifold.Models;

namespace Trifold.Data
{
	public interface IMapRepository : IRepository
	{
		bool AddMapFile(Maps map);
        bool ClearMapData(int eventId);
		List<Locations> GetAssignedLocations(int eventId);
		List<Locations> GetUnassignedLocations(int eventId);
		bool AddMarker(int eventId, int locationId, int x, int y);
		bool DeleteMarker(int eventId, int locationId);
		bool EditMarker(int eventId, int oldLocationId, int newLocationId, int x, int y);
		List<Locations> SearchUnassignedLocations(int eventId, string search);
	}
}