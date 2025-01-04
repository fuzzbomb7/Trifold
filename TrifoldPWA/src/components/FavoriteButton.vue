<template>
  <v-btn text small @click="toggleFavorite()">
    <template v-if="toggle"
      ><v-icon left color="yellow darken-3">mdi-star-outline</v-icon>Saved</template
    >
    <template v-if="!toggle"
      ><v-icon left color="grey">mdi-star-outline</v-icon>Save</template
    >
  </v-btn>
</template>

<script>
export default {
  created() {
    this.toggle = this.favorites.includes(this.id);
  },

  props: ["id"],

  data() {
    return {
      toggle: false,
    };
  },

  watch: {
    favorites: function () {
      this.toggle = this.favorites.includes(this.id);
    },
  },

  computed: {
    favorites() {
      return this.$store.state.favorites;
    },
    beers() {
      return this.$store.state.beers;
    },
  },

  methods: {
    toggleFavorite() {
      let beerId = this.id;
      let selectedBeer = _.find(this.beers, function (b) {
        return b.Id == beerId;
      });
      if (this.favorites.includes(this.id)) {
        this.$store.commit("removeFavorite", this.id);
        this.toggle = false;
        this.showSnackbar(
          `<span class="font-weight-bold">${selectedBeer.BreweryName} - ${selectedBeer.BeerName}</span> removed from <span class="font-italic">My Beers</span>&nbsp;  tab`
        );
      } else {
        this.$store.commit("addFavorite", this.id);
        this.toggle = true;
        this.showSnackbar(
          `<span class="font-weight-bold">${selectedBeer.BreweryName} - ${selectedBeer.BeerName}</span> added to <span class="font-italic">My Beers</span>&nbsp;  tab`
        );
      }
    },

    showSnackbar(text) {
      this.$store.commit("snackbarText", text);
      this.$store.commit("showSnackbar", true);
    },
  },
};
</script>