<template>
  <v-btn
    v-if="this.latitude != null && this.longitude != null"
    @click="showMap()"
    text
    small
  >
    <v-icon left color="red">mdi-map-marker</v-icon>Map
  </v-btn>
</template>

<script>
import MapButton from "@/components/MapButton.vue";

export default {
  props: ["latitude", "longitude", "tableName", "tableNumber", "name"],
  computed: {
    eventId() {
      return this.$store.state.eventId;
    },
  },
  methods: {
    showMap() {
      let locationName = null;
      if (this.tableName != null) {
        locationName = this.tableName;
      } else {
        locationName = "Table " + this.tableNumber;
      }
      locationName += "<br>" + "(" + this.name + ")";

      this.$router.push({ path: `/prost/${this.eventId}/map/${this.longitude}/${this.latitude}/${locationName}`});
    },
  },
};
</script>
