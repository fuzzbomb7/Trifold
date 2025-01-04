using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Models
{
	public class CsvRecord
	{
		public int Id { get; set; }
		public int CsvUploadId { get; set; }
		[ForeignKey("CsvUploadId")]
		public CsvFileUploads CsvFileUploads { get; set; }
		public CsvRecordProcessingEnum Processed { get; set; }
		public string Error { get; set; }
	}
}
