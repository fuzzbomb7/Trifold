import Vue from "vue";
import Vuex from "vuex";
import { vuexfireMutations, firestoreAction } from "vuexfire";
import { db } from "@/store/firestore";
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex);

export default new Vuex.Store({

	state: {
		// Firestore data
		beers: [],
		breweries: [],
		event: null,
		// Local user data
		checkIns: [],
		favorites: [],
		eventId: null,
		showCheckIns: false,
		deviceId: null,
		showSmsModalOnStartup: true,
		// Untappd user data
		untappdToken: null,
		untappdUser: null,
		// UI state
		drawer: null,
		beerTab: null,
		showBeerSearch: false,
		beerSearchTerm: "",
		showSnackbar: false,
		snackbarText: null,
		showCheckInModal: false,
		showSmsModal: false,
		checkInBeerId: null,
		beerTabScrollPositions: [], // { tab: integer, y: float }
	},

	getters: {
		// True for light text (dark theme), false for dark text (light theme)
		useDarkTheme: state => {
			return state.event.PrimaryContrast == 1 ? false : true;
		},
		// Get scroll position for specified beer tab
		getBeerTabScrollPosition: (state) => (tab) => {
			return state.beerTabScrollPositions.find(
				(x) => x.tab == tab
			);
		},
	},

	mutations: {
		...vuexfireMutations,
		// Add a checked-in beer
		addCheckIn(state, id) {
			state.checkIns.push(id);
		},
		// Add/remove from My Beers tab
		addFavorite(state, id) {
			state.favorites.push(id);
		},
		removeFavorite(state, id) {
			state.favorites.splice(state.favorites.indexOf(id), 1);
		},
		// Set event ID from URL on app start
		setEventId(state, id) {
			state.eventId = id;
		},
		// Show check-ins on My Beers tab
		showCheckIns(state, show) {
			state.showCheckIns = show;
		},
		// Toggle navigation drawer
		// Need to explicitly pass in boolean "val" from computed setter in App.vue (when drawer is closed)
		// Else the entire application hangs!
		toggleDrawer(state, val) {
			if (val != null) state.drawer = val;
			else state.drawer = !state.drawer;
		},
		// Current beer tab
		beerTab(state, val) {
			state.beerTab = val;
		},
		// Toggle search field
		showBeerSearch(state, show) {
			state.showBeerSearch = show;
		},
		// Current search term
		beerSearchTerm(state, term) {
			state.beerSearchTerm = term;
		},
		// Show snackbar
		showSnackbar(state, show) {
			state.showSnackbar = show;
		},
		// Set snackbar text. Supports HTML!
		snackbarText(state, val) {
			state.snackbarText = val;
		},
		// Set unique device ID for Untappd login
		setDeviceId(state, val) {
			state.deviceId = val;
		},
		// Set Untappd API token
		setUntappdToken(state, val) {
			state.untappdToken = val;
		},
		// Set user data for logged-in Untappd user. Note the object properties!
		setUntappdUserData(state, val) {
			if (val != null) {
				state.untappdUser = {
					userName: val.userName,
					name: val.name,
					avatarUrl: val.avatarUrl
				}
			} else {
				val = null;
			}
		},
		// Set scroll position for current beer tab
		setBeerTabScrollPosition(state, scrollPos) {	
			let scrollPosition = state.beerTabScrollPositions.find(
				(x) => x.tab == state.beerTab
			);
			if (scrollPosition == undefined) {
				state.beerTabScrollPositions.push({
					tab: state.beerTab,
					y: scrollPos,
				});
			} else {
				scrollPosition.y = scrollPos;
				let scrollIndex = state.beerTabScrollPositions.findIndex(
					(x) => x.tab == state.beerTab
				);
				state.beerTabScrollPositions[scrollIndex] = scrollPosition;
			}
		},
		// Set Untappd beer ID for beer to check in, and show check-in modal
		checkInBeer(state, id) {
			state.checkInBeerId = id;
			state.showCheckInModal = true;
		},
		// Show/hide check-in modal
		showCheckInModal(state, val) {
			state.showCheckInModal = val;
		},
		// Show/hide SMS modal
		showSmsModal(state, val) {
			state.showSmsModal = val;
		},
		// Don't show SMS modal on startup after first time
		showSmsModalOnStartup(state) {
			state.showSmsModalOnStartup = false;
		}
	},

	actions: {
		// Firestore actions
		getEvent: firestoreAction(({ bindFirestoreRef }, eventId) => {
			return bindFirestoreRef("event", db.doc(`events/${eventId}`), {reset: false});
		}),
		getBeers: firestoreAction(({ bindFirestoreRef }, eventId) => {
			return bindFirestoreRef(
				"beers",
				db.collection(`events/${eventId}/beers`), {reset: false}
			);
		}),
		getBreweries: firestoreAction(({ bindFirestoreRef }, eventId) => {
			return bindFirestoreRef(
				"breweries",
				db.collection(`events/${eventId}/breweries`), {reset: false}
			);
		}),
	},

	plugins: [new VuexPersistence({
		key: "trifold",
		// Persist these state properties
		// (Everything except UI state)
		reducer: (state) => ({
			beers: state.beers,
			breweries: state.breweries,
			event: state.event,
			checkIns: state.checkIns,
			favorites: state.favorites,
			eventId: state.eventId,
			showCheckIns: state.showCheckIns,
			deviceId: state.deviceId,
			untappdToken: state.untappdToken,
			untappdUser: state.untappdUser,
			showSmsModalOnStartup: state.showSmsModalOnStartup,
		})
	}).plugin],

});

