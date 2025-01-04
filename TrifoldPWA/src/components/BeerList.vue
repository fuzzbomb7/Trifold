<template>
  <div>
    <template v-if="searchTerm">
      <div v-if="tables == null || tables.length == 0" class="text-center font-weight-medium secondary--text mt-1">
        No results for "{{ searchTerm }}"
      </div>
      <div v-else-if="tables != null && tables.length > 0" class="text-center font-weight-medium secondary--text mt-1">
        Showing results for "{{ searchTerm }}"
      </div>
    </template>
    <div v-if="isFavorites" class="pl-1 mt-n2">
      <div
        v-if="(tables == null || tables.length == 0) && (!searchTerm)"
        class="h6 font-weight-medium text-center mt-4 grey--text"
      >
        Tap the <v-icon color="grey" class="pb-1">mdi-star-outline</v-icon> to
        add a beer to this list!
      </div>
      <v-switch
        v-else
        v-model="toggleShowCheckIns"
        label="Show checked-in beers"
        color="secondary"
        class="ml-3"
      ></v-switch>
    </div>
    <v-expansion-panels v-if="beers != null && beers.length > 0">
      <transition-group name="fade" style="width: 100%">
        <div
          v-for="table in tables"
          :key="table.TableNumber"
          style="width: 100%"
          class="mb-4"
        >
          <div class="subheader grey--text text--darken-2">
            {{
              table.AlternateName === null
                ? "Table " + table.TableNumber
                : table.AlternateName
            }}
          </div>
          <transition-group name="fade">
            <v-expansion-panel v-for="beer in table.Beers" :key="beer.BeerName">
              <v-expansion-panel-header>
                <v-list-item>
                  <v-list-item-content
                    :class="{
                      'font-italic':
                        beer.PourTime != null && !isPourTime(beer.PourTime),
                    }"
                  >
                    <div class="drink-header grey--text text--darken-3">
                      {{ beer.BeerName }}
                    </div>
                    <div class="drink-subheader grey--text text--darken-3">
                      {{ beer.BreweryName }}
                    </div>
                    <div class="drink-caption grey--text text--darken-2">
                      {{ beer.Style }}
                    </div>
                  </v-list-item-content>
                  <v-list-item-avatar tile size="55">
                    <v-img :src="renderLabel(beer.LabelUrl)" contain></v-img>
                  </v-list-item-avatar>
                </v-list-item>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-if="beer.PourTime != null" class="ml-4 mb-4 pour-time">
                  <v-icon class="grey--text darken-1">mdi-alarm</v-icon>
                  <span
                    v-if="isPourTime(beer.PourTime)"
                    class="ml-2 green--text text--accent-4"
                    >Pouring now!</span
                  >
                  <span v-else class="ml-2 blue--text"
                    >Pouring at {{ getPourTime(beer.PourTime) }}</span
                  >
                </div>
                <div class="abv-ibu mb-4 ml-5 grey--text text--darken-3">
                  <span class="mr-8" v-if="beer.Abv">ABV: {{ beer.Abv }}%</span>
                  <span v-if="beer.Ibu">IBU: {{ beer.Ibu }}</span>
                </div>
                <div
                  class="description mt-2 ml-5 mr-4 grey--text text--darken-2"
                >
                  {{ beer.Description }}
                </div>
                <div class="mt-4 mx-3 d-flex justify-space-between">
                  <FavoriteButton :id="beer.Id"></FavoriteButton>
                  <MapButton
                    :latitude="beer.Latitude"
                    :longitude="beer.Longitude"
                    :tableName="beer.AlternateName"
                    :tableNumber="beer.TableNumber"
                    :name="beer.BeerName"
                  ></MapButton>
                  <CheckinButton :id="beer.Id"></CheckinButton>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </transition-group>
        </div>
      </transition-group>
    </v-expansion-panels>
    <div v-if="(beers == null || beers.length == 0) && !isFavorites" class="h6 font-weight-medium text-center mt-2 grey--text">The beer list is empty!</div>
  </div>
</template>

<script>
import FavoriteButton from "@/components/FavoriteButton.vue";
import MapButton from "@/components/MapButton.vue";
import CheckinButton from "@/components/CheckinButton.vue";
import format from "date-fns/format";
import { Timestamp } from "@/store/firestore.js";

export default {
  props: {
    tables: {
      type: Array,
    },
    isFavorites: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    toggleShowCheckIns: {
      get() {
        return this.$store.state.showCheckIns;
      },
      set(val) {
        this.$store.commit("showCheckIns", val);
      },
    },
    searchTerm() {
      return this.$store.state.beerSearchTerm;
    },
    beers() {
      return this.$store.state.beers;
    },
  },

  methods: {
    renderLabel(labelUrl) {
      return (
        labelUrl ??
        "https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png"
      );
    },
    isPourTime(time) {
      let pourTime = time.valueOf();
      let now = Timestamp.now().valueOf();
      if (pourTime < now) return true;
      else return false;
    },
    getPourTime(time) {
      let pourTime = time.toDate();
      return format(pourTime, "h:mm a");
    },
  },

  components: {
    FavoriteButton,
    MapButton,
    CheckinButton,
  },
};
</script>

<style scoped>
.subheader {
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  margin: 8px;
}

.description {
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.4;
}

.abv-ibu {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.2;
}

.pour-time {
  font-size: 0.8125rem;
  font-weight: 500;
}
</style>