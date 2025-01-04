<template>
  <v-btn text small @click="viewBeers()">
    <v-icon left color="yellow darken-3">mdi-beer</v-icon>View Beers
  </v-btn>
</template>

<script>
export default {
  props: ["breweryName"],

  methods: {
    viewBeers() {
		this.$store.commit("showBeerSearch", true);
		this.$store.commit("beerSearchTerm", this.breweryName);
		this.$store.commit("beerTab", 0);
    this.$store.commit("setBeerTabScrollPosition", 0);
	},
  },
};
</script>
