using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Trifold.Models;
using Trifold.Models.Firestore;

namespace Trifold.Services
{
	public interface IFirestoreService
	{
		Task<DateTime?> WriteEventAndBeverageData(Events theEvent, List<Beers> beers);
		//Task<bool> WriteAppData(string applicationGuid, List<Events> events);
        Task<bool> WriteEventData(Events data);
    }
}