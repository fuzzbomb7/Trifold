using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
    public class PromotionModel //: AppStoreUrlModel
    {
        public int EventId { get; set; }
        public string PromoUrl { get; set; }
        public string QrUrl { get; set; }
    }

    /*public class AppStoreUrlModel
    {
        public string GooglePlayUrl { get; set; }
        public string AppStoreUrl { get; set; }
    }*/
}
