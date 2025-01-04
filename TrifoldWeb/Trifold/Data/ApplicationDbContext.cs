using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Trifold.Models;

namespace Trifold.Data
{
	public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
	{
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
			: base(options)
		{
		}

		public DbSet<Events> Events { get; set; }
		public DbSet<EventPromoters> EventPromoters { get; set; }
		public DbSet<Modules> Modules { get; set; }
		public DbSet<Beers> Beers { get; set; }
		public DbSet<CsvFileUploads> CsvFileUploads { get; set; }
		public DbSet<BeerCsvRecords> BeerCsvRecords { get; set; }
		public DbSet<Locations> Locations { get; set; }
		public DbSet<Maps> Maps { get; set; }
		public DbSet<MobileTokens> MobileTokens { get; set; }
        public DbSet<CustomContent> CustomContent { get; set; }
        public DbSet<PromoLinks> PromoLinks { get; set; }
        public DbSet<Engagement> Engagement { get; set; }
		public DbSet<Breweries> Breweries { get; set; }
	}
}
