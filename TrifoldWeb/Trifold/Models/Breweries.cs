using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class Breweries
    {
        public int Id { get; set; }
        [Required]
        public string BreweryName { get; set; }
        public string BreweryCity { get; set; }
        public string BreweryLogoUrl { get; set; }
        public int? UntappdBreweryId { get; set; }
        public List<Beers> Beers { get; set; } = new List<Beers>();
    }
}
