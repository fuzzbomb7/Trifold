<template>
  <v-navigation-drawer v-model="drawerToggle" app>
    <!-- Event logo, name & date -->
    <v-list>
      <v-list-item v-if="event.EventImageUrl">
        <v-list-item-content width="256" class="d-flex justify-start">
          <v-img :src="event.EventImageUrl" contain max-height="96"></v-img>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content class="pb-1">
          <v-list-item-title
            class="font-weight-medium"
            style="padding-bottom: 2px"
          >
            {{ event.EventName }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ getEventDate }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <!-- Nav links -->
    <v-list nav dense>
      <v-list-item-group color="secondary">
        <v-list-item :to="linkBeer">
          <v-list-item-icon>
            <v-icon color="brown">mdi-beer</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Beer</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item :to="linkMap">
          <v-list-item-icon>
            <v-icon color="red">mdi-map-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Map</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="pb-1"></v-divider>

        <v-list-item :to="linkUntappd">
          <v-list-item-icon>
            <v-icon color="amber darken-3">mdi-untappd</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Untappd</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item :to="linkAbout">
          <v-list-item-icon>
            <v-icon color="light-blue">mdi-information</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import format from "date-fns/format";
import { Timestamp } from "@/store/firestore.js";

export default {
	computed: {
    drawerToggle: {
      get() {
        return this.$store.state.drawer;
      },
      set(val) {
        this.$store.commit("toggleDrawer", val);
      },
    },
    event() {
      return this.$store.state.event;
    },
    eventId() {
      return this.$store.state.eventId;
    },

    // Format event date, with start/end dates if necessary
    getEventDate() {
      let eventStartTime = new Date(0).setUTCSeconds(this.event.EventStartDate.seconds);
      let eventEndTime = new Date(0).setUTCSeconds(this.event.EventEndDate.seconds);

      let eventDate = format(eventStartTime, "PPPP");
      let eventEndDate = format(eventEndTime, "PPPP");

      if (eventDate != eventEndDate) {
        eventDate += " - " + eventEndDate;
      }
      return eventDate;
    },

    // Nav links
    linkBeer() {
      return `/prost/${this.eventId}/beer`;
    },
    linkMap() {
      return `/prost/${this.eventId}/map`;
    },
    linkUntappd() {
      return `/prost/${this.eventId}/untappd?nav=true`;
    },
    linkAbout() {
      return `/prost/${this.eventId}/about`;
    },
  },
};
</script>

<style scoped>
</style>