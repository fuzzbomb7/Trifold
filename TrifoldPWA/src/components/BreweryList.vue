<template>
  <div>
    <template v-if="searchTerm">
      <div v-if="breweries == null || breweries.length == 0" class="text-center font-weight-medium secondary--text mt-1 mb-3">
        No results for "{{ searchTerm }}"
      </div>
      <div v-else-if="breweries.length > 0" class="text-center font-weight-medium secondary--text mt-1 mb-3">
        Showing results for "{{ searchTerm }}"
      </div>
    </template>
    <v-expansion-panels v-if="breweries != null && breweries.length > 0">
      <transition-group name="fade" style="width: 100%">
        <v-expansion-panel
          v-for="brewery in breweries"
          :key="brewery.BreweryName"
        >
          <v-expansion-panel-header>
            <v-list-item>
              <v-list-item-content>
                <div class="drink-header grey--text text--darken-3">
                  {{ brewery.BreweryName }}
                </div>
                <div class="drink-subheader grey--text text--darken-3">
                  {{ brewery.City }}
                </div>
                <div class="drink-caption grey--text text--darken-1">
                  {{ brewery.NumOfBeers }} beers
                </div>
              </v-list-item-content>
              <v-list-item-avatar tile size="55">
                <v-img :src="renderLabel(brewery.BreweryUrl)" contain></v-img>
              </v-list-item-avatar>
            </v-list-item>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="mx-3 d-flex justify-space-between">
              <MapButton
                :latitude="brewery.Latitude"
                :longitude="brewery.Longitude"
                :tableName="brewery.AlternateName"
                :tableNumber="brewery.TableNumber"
                :name="brewery.BreweryName"
              ></MapButton>
              <ViewBeersButton
                :breweryName="brewery.BreweryName"
              ></ViewBeersButton>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </transition-group>
    </v-expansion-panels>
    <div v-if="breweries.length == 0" class="h6 font-weight-medium text-center mt-2 grey--text">The brewery list is empty!</div>
  </div>
</template>

<script>
import ViewBeersButton from "@/components/ViewBeersButton";
import MapButton from "@/components/MapButton.vue";

export default {
  props: ["breweries"],

  computed: {
    searchTerm() {
      return this.$store.state.beerSearchTerm;
    },
  },

  methods: {
    renderLabel(labelUrl) {
      return (
        labelUrl ??
        "https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png"
      );
    },
  },

  components: {
    ViewBeersButton,
    MapButton,
  },
};
</script>
