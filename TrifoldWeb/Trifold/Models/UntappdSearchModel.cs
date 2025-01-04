using System.Collections.Generic;

namespace Trifold.Models
{
    public class UntappdSearchResponseModel
    {
        public Meta meta { get; set; }
        public Response response { get; set; }
    }

    public class Meta
    {
        public int code { get; set; }
        public string error_detail { get; set; }
        public string developer_friendly { get; set; }
    }

    public class Response
    {
        public string message { get; set; }
        public float time_taken { get; set; }
        public int brewery_id { get; set; }
        public string search_type { get; set; }
        public int type_id { get; set; }
        public int search_version { get; set; }
        public int found { get; set; }
        public int offset { get; set; }
        public int limit { get; set; }
        public string term { get; set; }
        public string parsed_term { get; set; }
        public BeerResults beers { get; set; }
        public string access_token { get; set; }
        public User user { get; set; }
    }

    public class BeerResults
    {
        public int count { get; set; }
        public List<Item> items { get; set; }
    }

    public class Item
    {
        public int checkin_count { get; set; }
        public bool have_had { get; set; }
        public int your_count { get; set; }
        public Beer beer { get; set; }
        public Brewery brewery { get; set; }
    }

    public class Beer
    {
        public int bid { get; set; }
        public string beer_name { get; set; }
        public string beer_label { get; set; }
        public float beer_abv { get; set; }
        public string beer_slug { get; set; }
        public int beer_ibu { get; set; }
        public string beer_description { get; set; }
        public string created_at { get; set; }
        public string beer_style { get; set; }
        public int in_production { get; set; }
        public float auth_rating { get; set; }
        public bool wish_list { get; set; }
    }

    public class Brewery
    {
        public int brewery_id { get; set; }
        public string brewery_name { get; set; }
        public string brewery_slug { get; set; }
        public string brewery_page_url { get; set; }
        public string brewery_type { get; set; }
        public string brewery_label { get; set; }
        public string country_name { get; set; }
        public Contact contact { get; set; }
        public Location location { get; set; }
        public int brewery_active { get; set; }
    }

    public class Contact
    {
        public string twitter { get; set; }
        public string facebook { get; set; }
        public string instagram { get; set; }
        public string url { get; set; }
    }

    public class Location
    {
        public string brewery_city { get; set; }
        public string brewery_state { get; set; }
        public float lat { get; set; }
        public float lng { get; set; }
    }


    public class User
    {
        public string user_name { get; set; }
        public string first_name { get; set; }
        public string last_name { get; set; }
        public string user_avatar { get; set; }
    }

}
