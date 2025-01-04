using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class PointOfInterestModel
    {
        public int Id { get; set; }
        public int TableNumber { get; set; }
        public string Location { get; set; }
        public int Latitude { get; set; }
        public int Longitude { get; set; }
    }
}
