<template>
  <div>
    <v-app-bar color="primary" :dark="useDarkTheme" fixed app dense>
      <v-app-bar-nav-icon @click.stop="toggleDrawer" />
      <template v-if="showSearch == false">
        <v-toolbar-title class="toolbar-title">{{
          event.EventName
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
      </template>
      <template v-else>
        <v-text-field
          v-model="searchTerm"
          class="pl-2 pt-4 font-italic"
          clearable
          full-width
          dense
          placeholder="Beer, brewery, style or table"
          style="font-size: 0.9375rem"
        ></v-text-field>
      </template>
      <v-btn icon @click="toggleSearch">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <template v-slot:extension>
        <v-tabs
          v-model="beerTab"
          grow
          slider-color="secondary"
          :color="textContrastColor"
          @change="changeTab"
        >
          <v-tab>Beer List</v-tab>
          <v-tab>My Beers</v-tab>
          <v-tab>Breweries</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-container fluid>
      <v-tabs-items v-model="beerTab">
        <v-tab-item>
          <BeerList :tables="tables"></BeerList>
        </v-tab-item>
        <v-tab-item>
          <BeerList :tables="myBeers" isFavorites></BeerList>
        </v-tab-item>
        <v-tab-item>
          <BreweryList :breweries="filteredBreweries"></BreweryList>
        </v-tab-item>
      </v-tabs-items>
      <Snackbar></Snackbar>
    </v-container>
    <CheckinModal></CheckinModal>
  </div>
</template>

<script>
import * as _ from "lodash";
import BeerList from "@/components/BeerList";
import BreweryList from "@/components/BreweryList";
import Snackbar from "@/components/Snackbar";
import CheckinModal from "@/components/CheckinModal";
import { isConnected } from "@/shared.js";

export default {
  async created() {
    if (await isConnected()) {
      // Get data from Firebase
      await this.$store.dispatch("getBeers", this.eventId);
      await this.$store.dispatch("getBreweries", this.eventId);
    } else {
      // No connection, pull from local storage and sort
      this.filterAndGroupBeers();
      this.filterBreweries();
    }

    // Listen for scroll events every 500ms
    document.addEventListener(
      "scroll",
      _.debounce(this.setScrollPosition, 500)
    );
    // Adjust tab & scroll position to last used
    this.changeTab(this.beerTab);
  },

  beforeDestroy() {
    document.removeEventListener(
      "scroll",
      _.debounce(this.setScrollPosition, 500)
    );
    // Prevent scroll location from updating when navigating away from page
    this.isScrollUpdating = true;
  },

  data() {
    return {
      // Beers filtered by search term
      filteredBeers: null,
      // Breweries filtered by search term
      filteredBreweries: null,
      // Beers grouped by table
      tables: null,
      // Beers filtered by favorites and grouped by table
      myBeers: null,
      // Semaphore flag to prevent scroll position from updating when tab is changed
      isScrollUpdating: false,
    };
  },

  computed: {
    eventId() {
      return this.$store.state.eventId;
    },
    event() {
      return this.$store.state.event;
    },
    beers() {
      return this.$store.state.beers;
    },
    breweries() {
      return this.$store.state.breweries;
    },
    favorites() {
      return this.$store.state.favorites;
    },
    checkIns() {
      return this.$store.state.checkIns;
    },
    showCheckIns() {
      return this.$store.state.showCheckIns;
    },
    useDarkTheme() {
      return this.$store.getters.useDarkTheme;
    },
    textContrastColor() {
      return this.useDarkTheme ? "white" : "black";
    },
    showSearch: {
      get() {
        return this.$store.state.showBeerSearch;
      },
      set(val) {
        return this.$store.commit("showBeerSearch", val);
      },
    },
    searchTerm: {
      get() {
        return this.$store.state.beerSearchTerm;
      },
      set(val) {
        return this.$store.commit("beerSearchTerm", val);
      },
    },
    beerTab: {
      get() {
        return this.$store.state.beerTab;
      },
      set(val) {
        return this.$store.commit("beerTab", val);
      },
    },
  },

  watch: {
    // Filter beers if beer list is updated
    beers: {
      deep: true,
      handler() {
        this.filterAndGroupBeers();
      },
    },
    // Filter favorite beers if favorites list is updated
    favorites: "filterAndGroupBeers",
    // Filter breweries if brewery list is updated
    breweries: "filterBreweries",
    // Filter beers and breweries if search term changes
    searchTerm: function () {
      this.filterAndGroupBeers();
      this.filterBreweries();
    },
    // Filter favorite beers if check-ins list is updated, or 'show checked-in beers' switch is changed
    showCheckIns: "sortFavoritesByTable",
    checkIns: "sortFavoritesByTable",
  },

  methods: {
    toggleDrawer() {
      this.$store.commit("toggleDrawer");
    },

    // Show search field
    toggleSearch() {
      this.$store.commit("showBeerSearch", !this.showSearch);
      this.searchTerm = null;
    },

    // Store scroll position for current tab
    setScrollPosition() {
      if (this.isScrollUpdating) return;
      this.$store.commit("setBeerTabScrollPosition", window.scrollY);
    },

    // Active tab has changed; adjust scroll position
    changeTab(selectedTab) {
      // Restore scroll position
      let scrollPosition = this.$store.getters.getBeerTabScrollPosition(
        selectedTab
      );
      this.isScrollUpdating = true;
      if (scrollPosition != undefined) {
        // Wait 250ms to adjust scroll position
        setTimeout(() => {
          window.scroll(0, scrollPosition.y);
          if (window.scrollY != scrollPosition.y) {
            let i = 0;
            // If current scroll position doesn't match stored one, repeat every 100ms for 1 second
            const doScroll = setInterval(() => {
              // Is current scroll position valid?
              let maxScrollPosition = document.body.clientHeight;
              let hasScrollBar =
                window.innerHeight < document.body.clientHeight;
              if (
                window.scrollY == scrollPosition.y ||
                maxScrollPosition <= scrollPosition.y ||
                !hasScrollBar ||
                i >= 10
              ) {
                clearInterval(doScroll);
                this.isScrollUpdating = false;
              } else {
                window.scroll(0, scrollPosition.y);
                i++;
              }
            }, 100);
          } else this.isScrollUpdating = false;
        }, 250);
      } else {
        // No scroll position found, just scroll to top
        window.scroll(0, 0);
        this.isScrollUpdating = false;
      }
    },

    // Filter beers by search term and favorites/checkins
    filterAndGroupBeers() {
      this.searchBeers();
      this.tables = this.sortBeersByTable(this.filteredBeers);
      this.sortFavoritesByTable();
    },

    // Filter breweries by search term and sort alphabetically
    filterBreweries() {
      let filtered = this.breweries;
      if (this.searchTerm) {
        let search = this.searchTerm.trim().toLowerCase();
        if (search.length > 0) {
          let breweries = this.breweries;
          filtered = _.filter(breweries, function (b) {
            return b.BreweryName.toLowerCase().includes(search);
          });
        }
      }
      this.filteredBreweries = _.sortBy(filtered, [
        function (b) {
          return b.BreweryName;
        },
      ]);
    },

    // Filter beers by search term
    searchBeers() {
      if (this.searchTerm) {
        let search = this.searchTerm.trim().toLowerCase();
        if (search.length > 0) {
          let beers = this.beers;
          this.filteredBeers = _.filter(beers, function (b) {
            return (
              b.BeerName.toLowerCase().includes(search) ||
              b.BreweryName.toLowerCase().includes(search) ||
              b.Style.toLowerCase().includes(search) ||
              b.TableNumber == search ||
              b.AlternateName == search
            );
          });
          return true;
        }
      } else {
        this.filteredBeers = this.beers;
        return false;
      }
    },

    // Group favorites by table
    sortFavoritesByTable() {
      let favoriteBeers = [];
      let beers = this.filteredBeers;
      let showCheckIns = this.showCheckIns;
      let checkIns = this.checkIns;
      _.forEach(this.favorites, function (f) {
        let favoriteBeer = _.find(beers, function (b) {
          return (
            b.Id == f &&
            ((showCheckIns == false && !checkIns.includes(b.Id)) ||
              showCheckIns == true)
          );
        });
        if (favoriteBeer != undefined) favoriteBeers.push(favoriteBeer);
      });
      this.myBeers = this.sortBeersByTable(favoriteBeers);
    },

    // Group beers by table
    sortBeersByTable(sortBeers) {
      let grouped = _.groupBy(sortBeers, (x) => x.TableNumber);
      return _.reduce(
        grouped,
        function (result, value, key) {
          let table = {
            TableNumber: parseInt(key),
            AlternateName: value[0].AlternateName,
            Beers: value,
          };
          if (isNaN(table.TableNumber)) {
            table.TableNumber = 0;
            table.AlternateName = "No Table Specified";
          }
          result.push(table);
          return result;
        },
        []
      );
    },
  },

  components: {
    BeerList,
    BreweryList,
    Snackbar,
    CheckinModal,
  },
};
</script>

<style>
</style>
