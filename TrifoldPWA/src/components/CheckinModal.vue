<template>
  <div>
    <v-dialog v-model="showCheckInModal" persistent max-width="400">
      <v-card class="pa-3">
        <v-overlay absolute :value="waitForConfirmation">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>
        <v-list-item>
          <v-list-item-avatar tile size="55">
            <v-img :src="renderLabel(getBeer.LabelUrl)" contain></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <div class="drink-header">{{ getBeer.BeerName }}</div>
            <div class="drink-subheader grey--text text--darken-3">
              {{ getBeer.BreweryName }}
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-slider
          v-model="rating"
          min="0"
          max="5"
          step="0.25"
          label="Rating"
          thumb-label="always"
          class="mt-9 ml-4 mr-3"
          value="2.5"
          track-color="grey lighten-1"
          thumb-color="grey darken-1"
          track-fill-color="secondary"
        ></v-slider>
        <v-textarea
          label="Comments (optional)"
          rows="1"
          counter
          :rules="maxComment"
          class="mx-3 mt-n2"
          v-model="comment"
          auto-grow
          color="secondary"
        ></v-textarea>
        <v-card-actions>
          <v-btn color="primary" :class="buttonTextColor" @click="checkIn()"
            >Check In</v-btn
          >
          <v-btn text @click="closeModal()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { API_ROOT } from "@/shared.js";
const axios = require("axios").default;

export default {
  
  data() {
    return {
      maxComment: [(v) => v.length <= 255 || "Max 255 characters"],
      rating: 2.5,
      comment: "",
      waitForConfirmation: false,
    };
  },

  computed: {
    // Show/hide this modal
    showCheckInModal: {
      get() {
        return this.$store.state.showCheckInModal;
      },
      set(val) {
        this.$store.commit("showCheckInModal", val);
      },
    },
    // Get beer information
    getBeer() {
      let beer = _.find(this.$store.state.beers, { Id: this.beerId });
      if (beer == null) {
        beer = {
          BeerName: null,
          BreweryName: null,
          LabelUrl: "",
        };
      }
      return beer;
    },
    // Get Untappd beer ID
    beerId() {
      return this.$store.state.checkInBeerId;
    },
    // User's Untappd token
    untappdToken() {
      return this.$store.state.untappdToken;
    },
    // This event Id
    eventId() {
      return this.$store.state.eventId;
    },
    buttonTextColor() {
      if (this.$store.getters.useDarkTheme) return "white--text";
      else return "black--text";
    },
  },

  methods: {
    checkIn() {
      // Show circular progress
      this.waitForConfirmation = true;
      // Post form data
      let data = new FormData();
      data.append("token", this.untappdToken);
      data.append("eventId", parseInt(this.eventId));
      data.append("beerId", this.beerId);
      data.append("rating", this.rating);
      data.append("shout", this.comment);
      data.append(
        "gmtOffset",
        (-new Date().getTimezoneOffset() / 60).toString()
      );
      // Check it in!
      axios
        .post(`${API_ROOT}/Untappd/Checkin`, data)
        .then((response) => {
          if (response.data.success == true) {
            // Add to check-in list and show modal
            this.$store.commit("addCheckIn", this.beerId);
            this.$store.commit(
              "snackbarText",
              `<span class="font-weight-bold">${this.getBeer.BreweryName} - ${this.getBeer.BeerName}</span> checked into Untappd successfully!`
            );
            this.$store.commit("showSnackbar", true);
            this.closeModal();
          } else {
            this.displayErrorMessage(response.data.error);
          }
        })
        .catch((error) => {
          this.displayErrorMessage(error);
        });
    },
    // Close modal and reset
    closeModal() {
      this.waitForConfirmation = false;
      this.showCheckInModal = false;
      this.rating = 2.5;
      this.comment = "";
    },
    renderLabel(labelUrl) {
      return (
        labelUrl ??
        "https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png"
      );
    },
    displayErrorMessage(msg) {
      this.$store.commit(
        "snackbarText",
        `There was a problem checking your beer into Untappd. Please try again. <br>[${msg}]`
      );
      this.$store.commit("showSnackbar", true);
      this.waitForConfirmation = false;
    },
  },
};
</script>

<style scoped>
</style>