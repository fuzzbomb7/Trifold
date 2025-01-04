<template>
  <div>
    <v-dialog v-model="showSmsModal" max-width="450">
      <v-card class="pa-2">
        <v-overlay absolute :value="waitForConfirmation">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-overlay>
        <v-card-title>Send a Link to Your Phone</v-card-title>
        <v-form ref="form">
        <v-card-text class="mb-n2">
          Send a link to this web app to your phone via SMS.<br />
          Save your favorite beers to your mobile device to try later!
          <v-text-field
            label="Enter your 10-digit phone number"
            v-model="phone"
            class="mt-3"
            color="secondary"
            :rules="phoneValidRules"
            autofocus
            counter="10"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            :class="buttonTextColor"
            class="ml-3"
            @click="sendSms()"
            >Send Link</v-btn
          >
          <v-btn text @click="closeModal()">No Thanks</v-btn>
        </v-card-actions>
        </v-form>
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
      phone: "",
      phoneValidRules: [
        (v) => (v.length <= 10 && !isNaN(v)) || "Invalid phone number",
      ],
      waitForConfirmation: false,
    };
  },

  computed: {
    // Show/hide this modal
    showSmsModal: {
      get() {
        return this.$store.state.showSmsModal;
      },
      set(val) {
        this.$store.commit("showSmsModal", val);
      },
    },

    buttonTextColor() {
      if (this.$store.getters.useDarkTheme) return "white--text";
      else return "black--text";
    },

    // This event Id
    eventId() {
      return this.$store.state.eventId;
    },
  },

  methods: {
    sendSms() {
      // Check if phone number valid
      let isValid = this.$refs.form.validate();

      this.waitForConfirmation = true;
      // Post form data
      let data = new FormData();
      data.append("eventId", parseInt(this.eventId));
      data.append("phoneNumber", this.phone);
      // Send SMS to number
      axios
        .post(`${API_ROOT}/SendSms`, data)
        .then((response) => {
          let success = response.data;
          if (success == true) {
            this.closeModal();
          } else {
            this.displayErrorMessage();
          }
        })
        .catch((error) => {
          this.displayErrorMessage();
        });
    },

    closeModal() {
      this.showSmsModal = false;
      this.waitForConfirmation = false;
    },

    displayErrorMessage() {
      this.$store.commit(
        "snackbarText",
        `There was a problem sending the SMS. Please check the number and try again.`
      );
      this.$store.commit("showSnackbar", true);
      this.waitForConfirmation = false;
    },
  },
};
</script>

<style scoped>
</style>