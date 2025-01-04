using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trifold.Models;

namespace Trifold.Data
{
	/// <summary>
	/// Base repository class that exposes underlying database context. 
	/// All repository classes must implement IRepository!
	/// </summary>
	public interface IRepository
	{
		ApplicationDbContext Context { get; }
    }
}
