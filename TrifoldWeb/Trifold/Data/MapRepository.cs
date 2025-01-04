using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;
using Trifold.Services;

namespace Trifold.Data
{
	public class MapRepository : IMapRepository
	{
		public ApplicationDbContext Context { get; private set; }
		private ILogger logger;
		private readonly IFirestoreService firestore;
        private readonly IStorageService storage;

        public MapRepository(ApplicationDbContext context, ILogger<EventRepository> logger, IFirestoreService firestore, IStorageService storage)
		{
			Context = context;
			this.logger = logger;
			this.firestore = firestore;
            this.storage = storage;
        }

		public bool AddMapFile(Maps map) 
		{
			try
			{
				Context.Maps.Add(map);
				Context.SaveChanges();

				var mapGuid = Path.GetFileNameWithoutExtension(map.MapPath);

				return true;
			}
			catch(Exception ex)
			{
				logger.LogError(ex, "Error adding new map file. {map}", JsonConvert.SerializeObject(map, Formatting.None, new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.Objects }));
				return false;
			}
		}

		public List<Locations> GetAssignedLocations(int eventId)
		{
			try
			{
				return Context.Locations.Where(x => x.EventId == eventId && (x.Latitude > 0 || x.Longitude > 0)).ToList();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error getting assigned locations. EventId: {eventId},", eventId);
				return new List<Locations>();
			}
		}

		public List<Locations> GetUnassignedLocations(int eventId)
		{
			try
			{
				return Context.Locations.Where(x => x.EventId == eventId && x.Latitude == 0 && x.Longitude == 0).ToList();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error getting unassigned locations. EventId: {eventId},", eventId);
				return new List<Locations>();
			}
		}

		public List<Locations> SearchUnassignedLocations(int eventId, string search)
		{
			try
			{
				return Context.Locations.Where(x => x.EventId == eventId && x.Latitude == 0 && x.Longitude == 0 
					&& (x.AlternateName.StartsWith(search) || x.TableNumber.Value.ToString().StartsWith(search))).ToList();
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error searching unassigned locations. EventId: {eventId}, Search: {search},", eventId, search);
				return new List<Locations>();
			}
		}

		public bool AddMarker(int eventId, int locationId, int x, int y)
		{
			try
			{
				var location = Context.Locations.Find(locationId);
				if (location.EventId != eventId) return false;

				location.Longitude = x;
				location.Latitude = y;
				Context.Locations.Update(location);
				Context.SaveChanges();

				//firestore.AddLocationAsync(location);
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error saving marker location. LocationId: {locationId}, X: {x}, Y: {y}", locationId, x, y);
				return false;
			}
		}

		public bool DeleteMarker(int eventId, int locationId)
		{
			try
			{
				var location = Context.Locations.Find(locationId);
				if (location.EventId != eventId) return false;

				location.Latitude = 0;
				location.Longitude = 0;
				Context.Locations.Update(location);
				Context.SaveChanges();

				//firestore.DeleteLocationAsync(eventId, locationId);
				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error deleting marker location. LocationId: {locationId}", locationId);
				return false;
			}
		}

		public bool EditMarker(int eventId, int oldLocationId, int newLocationId, int x, int y)
		{
			try
			{
				Locations oldLocation = null;
				Locations location = null;

				if (oldLocationId == newLocationId)
				{
					location = Context.Locations.Find(oldLocationId);
					if (location.EventId != eventId) return false;

					location.Longitude = x;
					location.Latitude = y;
					Context.Locations.Update(location);
				}
				else
				{
					oldLocation = Context.Locations.Find(oldLocationId);
					if (oldLocation.EventId != eventId) return false;

					oldLocation.Longitude = 0;
					oldLocation.Latitude = 0;
					Context.Locations.Update(oldLocation);

					location = Context.Locations.Find(newLocationId);
					if (location.EventId != eventId) return false;

					location.Longitude = x;
					location.Latitude = y;
					Context.Locations.Update(location);
				}

				Context.SaveChanges();

				//firestore.AddLocationAsync(location);
				//if (oldLocation != null) firestore.AddLocationAsync(oldLocation);

				return true;
			}
			catch (Exception ex)
			{
				logger.LogError(ex, "Error editing marker location. OldLocationId: {oldLocationId}, NewLocationId: {newLocationId}, X: {x}, Y: {y}", oldLocationId, newLocationId, x, y);
				return false;
			}
		}

        public bool ClearMapData(int eventId)
        {
            try
            {
                var map = Context.Maps.Where(x => x.EventId == eventId).FirstOrDefault();

                storage.DeleteFile(map.MapPath);

                Context.Maps.Remove(map);

                var markers = GetAssignedLocations(eventId);
                markers.ForEach(x => { x.Latitude = 0; x.Longitude = 0; });

                Context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error clearing map data. EventId: {eventId}", eventId);
                return false;
            }
        }
    }
}
