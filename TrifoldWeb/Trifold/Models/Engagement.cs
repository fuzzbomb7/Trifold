using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class Engagement
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string FacebookUrl { get; set; }
        public string FBID { get; set; }
        public string InstagramUrl { get; set; }
        public string TwitterUrl { get; set; }
        public string EmailUrl { get; set; }
        [ForeignKey("EventId")]
        public Events Event { get; set; }
    }
}
