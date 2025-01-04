// Local variables - set these in the HTML file!
var eventId = null;
var eventStartTime = null;

// Check for duplicates when searching for beers?
// (Typically yes, but not when we are replacing a beer)
var checkForDuplicate = true;

// Constants
const SEARCH_LIMIT = 25;

$(document).ready(function () {
	// Toastr options
	toastr.options.progressBar = true;
	toastr.options.timeOut = 3000;
	toastr.options.positionClass = 'toast-bottom-left';

	// Manual add autocompletes
	$('#Brewery_BreweryName').autoComplete({
		resolverSettings: {
			url: '/' + eventId + '/Beer/Brewery/Api/Search',
		},
		autoSelect: false,
		minLength: 2,
	});

	$('#Style').autoComplete({
		resolverSettings: {
			url: '/' + eventId + '/Beer/Style/Api/Search',
		},
		autoSelect: false,
		minLength: 2,
	});

	$('#Brewery_BreweryCity').autoComplete({
		resolverSettings: {
			url: '/' + eventId + '/Beer/City/Api/Search',
		},
		autoSelect: false,
		minLength: 2,
	});

	// Pour time
	$('.datetimepicker-input').datetimepicker({
		sideBySide: true,
		stepping: 15,
		minDate: eventStartTime,
		defaultDate: eventStartTime,
	});

	$('#PourTime').val(null);

});

// Search for beer
var table = null;
var limit = SEARCH_LIMIT;
var searchTerm = null;

function search() {
	searchTerm = $('#beer-search').val();
	if (searchTerm.trim() === '') return;

	var url = '/Beer/Api/Search?search=' + searchTerm;

	if (table === null) {

		table = $('#table').DataTable({
			pageLength: 25,
			autoWidth: false,
			dom: 'tipr',
			ajax: {
				dataSrc: 'beers',
				url: url
			},
			columns: [
				{
					data: 'labelUrl',
					render: function (data, type, row, meta) {
						return '<img src="' + data + '" height="50" />';
					}
				},
				{ data: 'beerName' },
				{ data: 'brewery.breweryName' },
				{ data: 'brewery.breweryCity' },
				{ data: 'style' },
				{ data: 'abv' },
				{ data: 'ibu' },
				{
					data: 'untappdBeerId',
					render: function (data, type, row, meta) {
						return '<button class="btn btn-primary add" data-id="' + data + '">Add</button>';
					}
				}
			]
		});

		$('#table').parent().addClass('table-overflow');

		// DataTables Ajax load event
		table.on('xhr.dt', function (e, settings, json, xhr) {
			$('#spinner').html("");
		});

		$('#search-results').css('visibility', 'visible');
	}
	else {
		table.ajax.url(url).load();
	}

	$('#spinner').html('<i class="fas fa-spinner fa-spin"></i>');
	limit = SEARCH_LIMIT;
}

// Search button
$('#search-button').click(function () {
	search();
});

// Search on enter key
$('#beer-search').keypress(function (e) {
	if (e.which === 13) {
		search();
		return false;
	}
});

// Clear button
$('#clear-button').click(function () {
	$('#beer-search').val('');
});

// Add from search
$('.card').on('click', '.add', function () {
	var id = $(this).data('id');
	var json = table.ajax.json();
	var find = json.beers.find(x => x.untappdBeerId === id);
	//find.locationId = locationId;

	$.post('/' + eventId + '/Beer/Api/Add', { beer: find, checkDuplicate: checkForDuplicate })
		.done(function (data) {
			if (data === 0) {
				toastAddSuccess(find);
				setDirty();
				newBeerAdded();
			}
			else if (data === 1) {
				toastAddFail(find);
			}
			else if (data === 2) {
				toastAddDuplicate(find);
			}
		})
		.fail(function () {
			toastAddFail(find);
		});
});

// Beer add toasts
function toastAddSuccess(beer) {
	toastr.success("Added to Beer List!", `${beer.brewery.breweryName} ${beer.beerName}`);
}

function toastAddFail(beer) {
	toastr.error(`Problem adding "${beer.brewery.breweryName} ${beer.beerName}". Please try again.`, "Error");
}

function toastAddDuplicate(beer) {
	toastr.warning(`"${beer.brewery.breweryName} ${beer.beerName}" is already in your Beer List!`, "Duplicate Beer");
}

// Add manually
$('#add-manual').click(function () {

	var validate = $('#add-edit-form').validate();
	var isValid = validate.form();

	if (isValid === false) return;

	var beer = {
		brewery: {
			breweryName: $('#Brewery_BreweryName').val(),
			breweryCity: $('#Brewery_BreweryCity').val(),
		},
		beerName: $('#BeerName').val(),
		style: $('#Style').val(),
		abv: $('#Abv').val(),
		ibu: $('#Ibu').val(),
		description: $('#Description').val(),
		untappdBeerId: $('#UntappdBeerId').val(),
		location: { tableNumber: $('#Location_TableNumber').val(), alternateName: $('#Location_AlternateName').val() },
		pourTime: $('#PourTime').val()
	};

	$.post('/' + eventId + '/Beer/Api/Add', { beer: beer, checkDuplicate: checkForDuplicate })
		.done(function (data) {
			if (data === 0) {
				toastAddSuccess(beer);
				newBeerAdded();
				setDirty();

				$('#Brewery_BreweryName').val('');
				$('#BeerName').val('');
				$('#Style').val('');
				$('#Abv').val('');
				$('#Ibu').val('');
				$('#Description').val('');
				$('#Brewery_BreweryCity').val('');
				$('#UntappdBeerId').val('');
				$('#Location_TableNumber').val('');
				$('#Location_AlternateName').val('');
				$('#PourTime').val('');
			}
			else if (data === 1) {
				toastAddFail(beer);
			}
			else if (data === 2) {
				toastAddDuplicate(beer);
			}
		})
		.fail(function () {
			toastAddFail(beer);
		});
});

// Load more
$('#load-more').click(function () {
	limit += SEARCH_LIMIT;
	if (limit > 50) {
		toastr.warning("Max 50 results! Please try another search.");
		return;
	}
	var url = `/Beer/Api/Search?search=${searchTerm}&limit=${limit}`;
	table.ajax.url(url).load(function () {
		table.page('last').draw('page');
	});
	$("html, body").animate({ scrollTop: 0 }, "slow");
});

// Autocomplete table name
$('#Location_TableNumber').change(function () {
	$.get('/' + eventId + '/Beer/Location/Api/Name', { tableNumber: $(this).val() })
		.done(function (data) {
			$('#Location_AlternateName').val(data);
		});
});

// Override this function to handle the add new beer event
function newBeerAdded() {}