using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class Ticketing
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string TicketUrl { get; set; }
        public bool SoldOut { get; set; }
        [ForeignKey("EventId")]
        public Events Event { get; set; }
    }
}
