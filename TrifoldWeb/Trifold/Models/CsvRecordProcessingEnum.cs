﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public enum CsvRecordProcessingEnum
	{
		NotProcessed,
		Processing,
		AddedUntappd,
        AddedNotFound,
        AddedDirect,
		Error
	}
}
