using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Trifold.Models
{
	public class Beers
	{
		public int Id { get; set; }
		public int EventId { get; set; }
		[ForeignKey("EventId")]
		public Events Event { get; set; }
		public string LabelUrl { get; set; }
		[Required]
		public string BeerName { get; set; }		
		public string Style { get; set; }
		public double Abv { get; set; }
		public int Ibu { get; set; }
		public string Description { get; set; }
		public int UntappdBeerId { get; set; }
		public int? LocationId { get; set; }
		[ForeignKey("LocationId")]
		public Locations Location { get; set; }
		public int? BreweryId { get; set; }
		[ForeignKey("BreweryId")]
		public Breweries Brewery { get; set; }
		public DateTime? PourTime { get; set; }
	}
}
