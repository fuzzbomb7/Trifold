<template>
  <div style="background-color: #fdf7ec; height: 100%">
    <v-container>
      <v-row>
        <v-col sm="10" offset-sm="1" md="8" offset-md="2">
          <v-img src="img/prost-logo.png" class="mb-4"></v-img>
          <v-text-field
            outlined
            prepend-inner-icon="mdi-magnify"
            background-color="white"
            rounded
            placeholder="Search for an event"
            dense
            v-model="search"
          ></v-text-field>
          <v-card :class="centerLoading">
            <template v-if="isLoading">
              <v-progress-circular
                size="48"
                color="primary"
                indeterminate
                class="ma-4"
              ></v-progress-circular>
            </template>
            <template v-else-if="isError">
              <v-card-text>
                <div>Unable to load events list. Please try again.</div>
              </v-card-text>
            </template>
            <template v-else-if="search.length < 2">
              <template v-if="events.currentEvents.length > 0">
                <v-card-title class="mb-n2">Today's Events</v-card-title>
                <v-card-text>
                  <v-list-item
                    v-for="event in events.currentEvents"
                    :key="event.eventId"
                    class="mb-n5"
                  >
                    <v-list-item-content class="pa-0">
                      <v-list-item-title
                        ><a :href="getUrl(event.eventId)"
                          >{{ event.eventName }} - {{ event.eventCity }},
                          {{ event.eventState }}</a
                        ></v-list-item-title
                      >
                    </v-list-item-content>
                  </v-list-item>
                </v-card-text>
              </template>
              <v-card-title class="mb-n2">Upcoming Events</v-card-title>
              <v-card-text class="pb-5">
                <v-list-item
                  v-for="event in events.upcomingEvents"
                  :key="event.eventId"
                >
                  <v-list-item-content class="mb-n2">
                    <v-list-item-title
                      ><a :href="getUrl(event.eventId)"
                        >{{ event.eventName }} - {{ event.eventCity }},
                        {{ event.eventState }}</a
                      ></v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      getDate(event.eventStartTime, event.eventEndTime)
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card-text>
            </template>
            <template v-else>
              <v-card-title class="mb-n2">Search Results</v-card-title>
              <v-card-text class="pb-5">
                <v-list-item v-for="event in searchEvents" :key="event.eventId">
                  <v-list-item-content class="mb-n2">
                    <v-list-item-title
                      ><a :href="getUrl(event.eventId)"
                        >{{ event.eventName }} - {{ event.eventCity }},
                        {{ event.eventState }}</a
                      ></v-list-item-title
                    >
                    <v-list-item-subtitle>{{
                      getDate(event.eventStartTime, event.eventEndTime)
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <div v-if="searchEvents.length == 0">No results found</div>
              </v-card-text>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { API_ROOT } from "@/shared.js";
const axios = require("axios").default;

export default {
  created() {
    // Reset event ID
    this.$store.commit("setEventId", null);

    // Set colors
    this.$vuetify.theme.themes.light.primary = "#ff7700";

    // Load event list from API
    axios
      .get(`${API_ROOT}/GetEvents`)
      .then((response) => {
        this.events = response.data;
        this.isLoading = false;
      })
      .catch(() => {
        this.isLoading = false;
        this.isError = true;
      });
  },

  data() {
    return {
      events: { currentEvents: [], upcomingEvents: [] },
      searchEvents: [],
      search: "",
      isLoading: true,
      isError: false,
    };
  },

  computed: {
    // Hack to get spinner to center in v-card
    centerLoading() {
      return this.isLoading ? "text-center" : "";
    },
  },

  methods: {
    getUrl(eventId) {
      return `/prost/${eventId}`;
    },
    getDate(startDate, endDate) {
      if (startDate == endDate) {
        return startDate;
      } else {
        return `${startDate} - ${endDate}`;
      }
    },
  },

  watch: {
    search: function (newValue, oldValue) {
      if (newValue.length > 1) {
        axios
          .get(`${API_ROOT}/SearchEvents?searchTerm=${newValue}`)
          .then((response) => {
            this.searchEvents = response.data;
          });
      }
    },
  },
};
</script>

<style scoped>
li {
  list-style: none;
  font-size: 0.9375rem;
}

a:link {
  text-decoration: none;
}
</style>