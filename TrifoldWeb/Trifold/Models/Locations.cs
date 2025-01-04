using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	[FirestoreData]
	public class Locations
	{
		public int Id { get; set; }
		public int EventId { get; set; }
		[FirestoreProperty]
		public string AlternateName { get; set; }
		[FirestoreProperty]
		public int? TableNumber { get; set; }
		[FirestoreProperty]
		public int Latitude { get; set; }
		[FirestoreProperty]
		public int Longitude { get; set; }
		[ForeignKey("EventId")]
		public Events Event { get; set; }
	}
}
