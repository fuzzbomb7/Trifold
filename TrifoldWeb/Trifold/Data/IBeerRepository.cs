using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using Trifold.Models;

namespace Trifold.Data
{
	public interface IBeerRepository : IRepository
	{
		bool AddBeer(Beers beer);
		List<string> BreweryAutocomplete(string term);
		bool DeleteBeer(int beerId, int eventId);
		bool DoesBeerExist(int eventId, Beers beer);
		Beers GetBeer(int beerId, int eventId);
		List<Beers> GetBeers(int eventId);
		List<string> StyleAutocomplete(string term, int eventId);
		List<string> CityAutocomplete(string term, int eventId);
		bool UpdateBeer(Beers beer);
		bool AddBeerCsvRecords(IEnumerable<BeerCsvRecords> records);
		int AddCsvUpload(string fileName, int eventId);
		List<BeerCsvRecords> GetBeerCsvRecords(int csvUploadId);
		bool UpdateBeerCsvRecords(List<BeerCsvRecords> records);
		bool UpdateCsvUploadStatus(int csvUploadId, CsvFileProgress newProgress);
		List<CsvFileUploads> GetCsvFileUploads(int eventId);
		CsvRecordCount GetCsvRecordCount(int csvUploadId);
		BeerCsvRecords GetNextBeerCsvRecord();
		bool UpdateBeerCsvRecord(BeerCsvRecords record);
		CsvFileUploads GetCsvFileUpload(int id);
		string GetEmailByEventId(int eventId);
        bool ResetStuckBeerCsvRecords(int csvUploadId);
        bool RemoveBeerCsvRecords(int csvUploadId);
        bool CheckRemoveLocation(int? locationId);
        int? SearchLocation(int eventId, int tableNumber);
        int AddGetLocation(int eventId, int tableNumber, string alternateName);
        bool RemoveLocation(int locationId);
		string GetLocationAlternateName(int eventId, int tableNumber);
		List<BreweryModel> GetBreweries(int eventId);
		List<Beers> GetBeers(int eventId, int breweryId);
		bool MergeBrewery(List<Beers> beers, int newBreweryId, int? locationId);
		int? AddGetBrewery(Breweries brewery);
		bool UpdateBrewery(Breweries brewery);
		Locations GetBreweryLocation(int eventId, int breweryId);
		bool SetBreweryLocation(int eventId, int breweryId, int locationId);
		bool RemoveBrewery(Breweries brewery);
		Breweries GetBrewery(int breweryId);
		System.DateTime GetPourStartTime(int eventId);
	}
}