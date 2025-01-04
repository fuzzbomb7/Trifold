using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class BreweryModel
    {
        public int BreweryId { get; set; }
        public string BreweryName { get; set; }
        public string BreweryCity { get; set; }
        public string BreweryLogoUrl { get; set; }
        public int NumberOfBeers { get; set; }
        [JsonIgnore]
        public List<Locations> Locations { get; set; }
        public string TableNumbers { get; set; }
    }
}
