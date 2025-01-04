using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class CsvFileUploads
	{
		public int Id { get; set; }
		public int EventId { get; set; }
		[ForeignKey("EventId")]
		public Events Event { get; set; }
		public string FileName { get; set; }
		public CsvFileProgress Progress { get; set; }
		public DateTime UploadDate { get; set; }
		[NotMapped]
		public CsvRecordCount Count { get; set; } = new CsvRecordCount();
	}

	public enum CsvFileProgress
	{
		Pending,
		Error,
		InProgress,
		Completed,
        Canceled
	}

	public class CsvRecordCount
	{
		public int Total { get; set; }
		public int Completed { get; set; }
        public int Pending { get; set; }
        public int Processing { get; set; }
	}
}
