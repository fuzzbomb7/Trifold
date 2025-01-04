using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Models
{
	public class UserSideNavModel
	{
		public string CurrentPage { get; set; }
		public int? EventId { get; set; }
		public List<ModuleEnum> Modules { get; set; }
		public int WhiteLabelId { get; set; }
	}
}
