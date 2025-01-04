using System.Collections.Generic;
using Trifold.Models;

namespace Trifold.Data
{
	public interface IEventRepository : IRepository
	{
		Dictionary<string, dynamic> GetEventData(Modules module);
	}
}