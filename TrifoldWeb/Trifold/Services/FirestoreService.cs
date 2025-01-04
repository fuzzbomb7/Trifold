using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using Grpc.Auth;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Data;
using Trifold.Models;
using Trifold.Models.Firestore;

namespace Trifold.Services
{
    public class FirestoreService : IFirestoreService
	{
		private readonly FirestoreDb db;
		private readonly ILogger logger;
        private readonly ISharedRepository shared;

        public FirestoreService(ILogger<FirestoreService> logger, ISharedRepository shared)
		{
			this.logger = logger;
            this.shared = shared;
            this.db = CreateDbInstance();
		}

		private FirestoreDb CreateDbInstance()
		{
			try
			{
				var creds = GoogleCredential.FromFile("firestore.json");
				var channel = new Channel(FirestoreClient.DefaultEndpoint.Host, FirestoreClient.DefaultEndpoint.Port, creds.ToChannelCredentials());
				var client = FirestoreClient.Create(channel);
				return FirestoreDb.Create("trifold-data", client);
			}
			catch (Exception e)
			{
				logger.LogError(e, "Error creating Firestore DB instance");
				return null;
			}
		}

        public async Task<bool> WriteEventData(Events data)
        {
            var eventDoc = db.Document($"events/{data.Id}");

            try
            {
                var eventData = GetEvent(data);
                var result = await eventDoc.SetAsync(eventData);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error writing event data to Firestore DB. EventId: {eventId}, Data: {data}", data.Id, 
                    JsonConvert.SerializeObject(data, Formatting.None, new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.Objects }));
                return false;
            }
        }

        public async Task<DateTime?> WriteEventAndBeverageData(Events theEvent, List<Beers> beers)
		{
			int eventId = 0;

			try
            {
                const int MAX_WRITES = 500;

                var batchData = new List<BatchData>();
                var lastUpdated = DateTime.Now;
                eventId = theEvent.Id;

                var eventDoc = db.Document($"events/{eventId}");
                Event eventData = GetEvent(theEvent);
                batchData.Add(new BatchData { Document = eventDoc, Data = eventData });

                // Add beers
                foreach (var beer in beers)
                {
                    var addBeer = new Models.Firestore.Beer
                    {
                        Abv = beer.Abv,
                        BeerName = beer.BeerName,
                        BreweryName = beer.Brewery?.BreweryName,
                        Description = beer.Description,
                        Ibu = beer.Ibu,
                        LabelUrl = beer.LabelUrl,
                        Latitude = beer.Location?.Latitude,
                        Longitude = beer.Location?.Longitude,
                        Style = beer.Style,
                        UntappdBeerId = beer.UntappdBeerId,
                        TableNumber = beer.Location?.TableNumber,
                        AlternateName = beer.Location?.AlternateName,
                        PourTime = beer.PourTime.HasValue ? DateTime.SpecifyKind(beer.PourTime.Value, DateTimeKind.Utc) : new DateTime?(),
                        Id = beer.Id
                    };

                    var beerDoc = db.Document($"events/{eventId}/beers/{beer.Id}");
                    batchData.Add(new BatchData { Document = beerDoc, Data = addBeer });
                }

                // Add breweries
                var groupByBrewery = beers.GroupBy(x => x.Brewery.BreweryName);
                foreach (var brewery in groupByBrewery)
                {
                    var getBrewery = brewery.First();

                    var addBrewery = new Models.Firestore.Brewery
                    {
                        BreweryName = brewery.Key,
                        City = getBrewery.Brewery?.BreweryCity,
                        NumOfBeers = brewery.Count(),
                        Latitude = getBrewery.Location?.Latitude,
                        Longitude = getBrewery.Location?.Longitude,
                        BreweryUrl = getBrewery.Brewery?.BreweryLogoUrl,
                        TableNumber = getBrewery.Location?.TableNumber,
                        AlternateName = getBrewery.Location?.AlternateName,
                    };

                    var useId = getBrewery.BreweryId;

                    var breweryDoc = db.Document($"events/{eventId}/breweries/{useId}");
                    batchData.Add(new BatchData { Document = breweryDoc, Data = addBrewery });
                }

                // Write batches
                decimal numBatches = Math.Ceiling((decimal)batchData.Count / MAX_WRITES);

                for (int batches = 0; batches < numBatches; batches++)
                {
                    int batchCount = 0;
                    var batch = db.StartBatch();

                    // Delete existing data and collections
                    if (batches == 0)
                    {
                        int deleteCount = 0;

                        // event document
                        batch.Delete(eventDoc);

                        // beers collection
                        var beerCol = await db.Collection($"events/{eventId}/beers").GetSnapshotAsync();
                        foreach (var beer in beerCol.Documents)
                        {
                            batch.Delete(beer.Reference);
                            deleteCount++;
                        }

                        // breweries collection
                        var brewCol = await db.Collection($"events/{eventId}/breweries").GetSnapshotAsync();
                        foreach (var brew in brewCol.Documents)
                        {
                            batch.Delete(brew.Reference);
                            deleteCount++;
                        }

                        batchCount = deleteCount;
                    }

                    var pullBatchData = batchData.Skip(MAX_WRITES * batches).Take(MAX_WRITES - batchCount);

                    foreach (var item in pullBatchData)
                    {
                        batch.Set(item.Document, item.Data);
                    }

                    await batch.CommitAsync();
                }

                return lastUpdated;
            }
            catch (Exception e)
			{
				logger.LogError(e, "Error writing event and beverage data to Firestore DB. EventId: {eventId}, Event: {data}", eventId, JsonConvert.SerializeObject(theEvent, Formatting.None, new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.Objects }));
				return null;
			}
		}

        /// <summary>
        /// Returns a Firestore event data class
        /// </summary>
        /// <param name="theEvent">Local db event model</param>
        /// <returns>Firestore db event model</returns>
        private Event GetEvent(Events theEvent)
        {
            var eventData = new Models.Firestore.Event();

            eventData.EventCity = theEvent.EventCity;
            eventData.EventEndDate = DateTime.SpecifyKind(theEvent.EventEndTime, DateTimeKind.Utc);
            eventData.EventImageUrl = shared.GetCDNLink(theEvent.EventImageUrl);
            eventData.PrimaryColor = theEvent.EventPrimaryColor;
            eventData.PrimaryContrast = theEvent.EventTextContrast;
            eventData.SecondaryColor = theEvent.EventSecondaryColor;
            eventData.EventName = theEvent.EventName;
            eventData.EventStartDate = DateTime.SpecifyKind(theEvent.EventStartTime, DateTimeKind.Utc);
            eventData.EventState = theEvent.EventState;
            eventData.EventUrl = theEvent.EventUrl;
            eventData.FoursquareId = theEvent.FoursquareId;
            eventData.Latitude = theEvent.Latitude;
            eventData.Longitude = theEvent.Longitude;
            eventData.MapUrl = shared.GetCDNLink(theEvent.Map?.MapPath);
            eventData.MapHeight = theEvent.Map?.Height;
            eventData.MapWidth = theEvent.Map?.Width;
            eventData.Modules = theEvent.Modules.Select(x => x.ModuleId).ToList();
            eventData.TimeZone = theEvent.TimeZone;
            eventData.LastUpdated = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
            eventData.Id = theEvent.Id;
            /*eventData.EmailUrl = theEvent.Engagement?.EmailUrl;
            eventData.FacebookUrl = theEvent.Engagement?.FacebookUrl;
            eventData.FBID = theEvent.Engagement?.FBID;
            eventData.InstagramUrl = theEvent.Engagement?.InstagramUrl;
            eventData.TwitterUrl = theEvent.Engagement?.TwitterUrl;*/

            if (string.IsNullOrWhiteSpace(theEvent.CustomContent?.HtmlContent) == false) eventData.CustomContentUrl = $"https://trifoldweb.azurewebsites.net/{theEvent.Id}/CustomViewer";
            else eventData.CustomContentUrl = theEvent.CustomContent?.Url;
            return eventData;
        }

	}
}
