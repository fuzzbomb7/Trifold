using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models.Firestore
{
	[FirestoreData]
	public class Beer
	{
		[FirestoreProperty]
		public string LabelUrl { get; set; }
		[FirestoreProperty]
		public string BeerName { get; set; }
		[FirestoreProperty]
		public string BreweryName { get; set; }
		[FirestoreProperty]
		public string Style { get; set; }
		[FirestoreProperty]
		public double Abv { get; set; }
		[FirestoreProperty]
		public int Ibu { get; set; }
		[FirestoreProperty]
		public string Description { get; set; }
		[FirestoreProperty]
		public int UntappdBeerId { get; set; }
		[FirestoreProperty]
		public int? Latitude { get; set; }
		[FirestoreProperty]
		public int? Longitude { get; set; }
		[FirestoreProperty]
		public string AlternateName { get; set; }
		[FirestoreProperty]
		public int? TableNumber { get; set; }
		[FirestoreProperty]
		public DateTime? PourTime { get; set; }
		[FirestoreProperty]
		public int Id { get; set; }
	}

	[FirestoreData]
	public class Brewery
	{
		[FirestoreProperty]
		public string BreweryName { get; set; }
		[FirestoreProperty]
		public string City { get; set; }
		[FirestoreProperty]
		public int NumOfBeers { get; set; }
		[FirestoreProperty]
		public int? Latitude { get; set; }
		[FirestoreProperty]
		public int? Longitude { get; set; }
		[FirestoreProperty]
		public string BreweryUrl { get; set; }
		[FirestoreProperty]
		public string AlternateName { get; set; }
		[FirestoreProperty]
		public int? TableNumber { get; set; }
	}

	[FirestoreData]
	public class Event : AppEvent
	{
		[FirestoreProperty]
		public string EventUrl { get; set; }
		[FirestoreProperty]
		public DateTime LastUpdated { get; set; }
		[FirestoreProperty]
		public string TimeZone { get; set; }
		[FirestoreProperty]
		public double Latitude { get; set; }
		[FirestoreProperty]
		public double Longitude { get; set; }
		[FirestoreProperty]
		public string FoursquareId { get; set; }
		[FirestoreProperty]
		public string MapUrl { get; set; }
		[FirestoreProperty]
		public int? MapWidth { get; set; }
		[FirestoreProperty]
		public int? MapHeight { get; set; }
		[FirestoreProperty]
		public List<ModuleEnum> Modules { get; set; }
        //[FirestoreProperty]
        // public string EventAddress { get; set; }
        [FirestoreProperty]
        public string PrimaryColor { get; set; }
        [FirestoreProperty]
        public TextContrastEnum PrimaryContrast { get; set; }
        [FirestoreProperty]
        public string SecondaryColor { get; set; }
        [FirestoreProperty]
        public string CustomContentUrl { get; set; }
        [FirestoreProperty]
        public string FacebookUrl { get; set; }
        [FirestoreProperty]
        public string FBID { get; set; }
        [FirestoreProperty]
        public string InstagramUrl { get; set; }
        [FirestoreProperty]
        public string TwitterUrl { get; set; }
        [FirestoreProperty]
        public string EmailUrl { get; set; }
        [FirestoreProperty]
        public string EventImageUrl { get; set; }
    }

	[FirestoreData]
	public class AppEvent
	{
		[FirestoreProperty]
		public int Id { get; set; }
		[FirestoreProperty]
		public string EventName { get; set; }
		[FirestoreProperty]
		public string EventCity { get; set; }
		[FirestoreProperty]
		public string EventState { get; set; }
		[FirestoreProperty]
		public DateTime EventStartDate { get; set; }
		[FirestoreProperty]
		public DateTime EventEndDate { get; set; }
        /*[FirestoreProperty]
        public DateTime? TicketingStartDate { get; set; }
        [FirestoreProperty]
        public DateTime? TicketingEndDate { get; set; }
        [FirestoreProperty]
        public string TicketUrl { get; set; }
        [FirestoreProperty]
        public bool? SoldOut { get; set; }*/
    }

	public class BatchData
	{
		public DocumentReference Document { get; set; }
		public object Data { get; set; }
	}

}
