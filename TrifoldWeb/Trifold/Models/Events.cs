using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class Events
	{
		public int Id { get; set; }
		public string EventName { get; set; }
		public DateTime EventStartTime { get; set; }
		public DateTime EventEndTime { get; set; }
		public string EventAddress { get; set; }
		public string EventCity { get; set; }
		public string EventState { get; set; }
		public string EventZip { get; set; }
		[Url]
		public string EventUrl { get; set; }
		public bool IsActive { get; set; }
		public int EventPromoterId { get; set; }
		[ForeignKey("EventPromoterId")]
		public EventPromoters EventPromoter { get; set; }
		public List<Modules> Modules { get; set; } = new List<Modules>();
		[NotMapped]
		[FromForm]
		public List<int> SelectedModules { get; set; }
		public List<Beers> Beers { get; set; }
		public Maps Map { get; set; }
		public DateTime? LastUpdated { get; set; }
		public string TimeZone { get; set; }
		public double Latitude { get; set; }
		public double Longitude { get; set; }
		public string FoursquareId { get; set; }
		public string EventImageUrl { get; set; }
		public string EventPrimaryColor { get; set; }
        public TextContrastEnum EventTextContrast { get; set; }
        public string EventSecondaryColor { get; set; }
        //public bool AddToProst { get; set; }
        public bool IsDirty { get; set; }
        public CustomContent CustomContent { get; set; }
        public Engagement Engagement { get; set; }
        //public Ticketing Ticketing { get; set; }
		public PromoLinks Promotion { get; set; }
	}
}