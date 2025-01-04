using Microsoft.AspNetCore.Server.Kestrel.Core.Internal.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Trifold.Services
{
	/// <summary>
	/// Interface for currently-used HttpClient methods and properties
	/// </summary>
	public interface IHttpClient
	{
		Uri BaseAddress { get; set; }
		Task<HttpResponseMessage> GetAsync(string requestUri);
		Task<HttpResponseMessage> PostAsync(string requestUri, HttpContent content);
		System.Net.Http.Headers.HttpRequestHeaders DefaultRequestHeaders { get; }

	}

	/// <summary>
	/// Concrete class that inherits both HttpClient and the interface above for dependency injection
	/// </summary>
	public class HttpClientService : HttpClient, IHttpClient { }
}
