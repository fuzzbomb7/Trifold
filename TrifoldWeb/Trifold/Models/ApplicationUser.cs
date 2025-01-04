using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Models
{
	public class ApplicationUser : IdentityUser
	{
		public int? EventPromoterId { get; set; }
		[ForeignKey("EventPromoterId")]
		public EventPromoters EventPromoter { get; set; }
		public string UntappdAccessToken { get; set; }
	}
}
