using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class FoursquareVenueSearchResult
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}


namespace Trifold.Models.Foursquare
{

    public class VenueSearchResult
    {
        public Meta meta { get; set; }
        public Response response { get; set; }
    }

    public class Meta
    {
        public int code { get; set; }
        public string requestId { get; set; }
    }

    public class Response
    {
        public List<Venue> venues { get; set; }
    }

    public class Venue
    {
        public string id { get; set; }
        public string name { get; set; }
        public Contact contact { get; set; }
        public Location location { get; set; }
        //public Category[] categories { get; set; }
        public bool verified { get; set; }
        public Stats stats { get; set; }
        public Beenhere beenHere { get; set; }
        public Specials specials { get; set; }
        public string referralId { get; set; }
        //public Venuechain[] venueChains { get; set; }
        public bool hasPerk { get; set; }
        public bool allowMenuUrlEdit { get; set; }
        public string url { get; set; }
        public Menu menu { get; set; }
        public Venuepage venuePage { get; set; }
        public bool venueRatingBlacklisted { get; set; }
        public string storeId { get; set; }
        public bool hasMenu { get; set; }
    }

    public class Contact
    {
        public string phone { get; set; }
        public string formattedPhone { get; set; }
        public string twitter { get; set; }
        public string facebook { get; set; }
        public string facebookUsername { get; set; }
        public string facebookName { get; set; }
    }

    public class Location
    {
        public string address { get; set; }
        public string crossStreet { get; set; }
        public float lat { get; set; }
        public float lng { get; set; }
        //public Labeledlatlng[] labeledLatLngs { get; set; }
        public string postalCode { get; set; }
        public string cc { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public string country { get; set; }
        public List<string> formattedAddress { get; set; }
    }

    public class Stats
    {
        public int tipCount { get; set; }
        public int usersCount { get; set; }
        public int checkinsCount { get; set; }
    }

    public class Beenhere
    {
        public int lastCheckinExpiredAt { get; set; }
    }

    public class Specials
    {
        public int count { get; set; }
        public object[] items { get; set; }
    }

    public class Menu
    {
        public string type { get; set; }
        public string label { get; set; }
        public string anchor { get; set; }
        public string url { get; set; }
        public string mobileUrl { get; set; }
        public string externalUrl { get; set; }
    }

    public class Venuepage
    {
        public string id { get; set; }
    }

}
