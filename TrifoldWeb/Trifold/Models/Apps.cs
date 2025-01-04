
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class Apps
	{
		public int Id { get; set; }
		public string AppName { get; set; }
		public string ApplicationId { get; set; }
		public string SplashImageUrl { get; set; }
		public string PrimaryColor { get; set; }
        public TextContrastEnum TextContrast { get; set; }
        public List<EventPromoters> EventPromoters { get; set; }
		public bool IsPublished { get; set; }
		public bool IsWhiteLabel { get; set; }
		public string AndroidAppStoreUrl { get; set; }
		public string iOSAppStoreUrl { get; set; }
        public string SecondaryColor { get; set; }
        public string AppIconUrl { get; set; }
	}
}
