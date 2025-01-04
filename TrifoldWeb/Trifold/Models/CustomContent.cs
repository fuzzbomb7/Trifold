using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class CustomContent
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string Url { get; set; }
        public string HtmlContent { get; set; }
        [ForeignKey("EventId")]
        public Events Event { get; set; }
    }
}
