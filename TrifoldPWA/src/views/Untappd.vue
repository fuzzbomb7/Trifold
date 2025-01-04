<template>
  <div>
    <v-app-bar color="primary" :dark="useDarkTheme" dense>
      <v-app-bar-nav-icon v-if="isNavigatedTo == false">
        <template v-slot:default>
          <v-icon @click="$router.go(-1)">mdi-arrow-left</v-icon>
        </template>
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon v-else @click.stop="toggleDrawer" />
      <v-toolbar-title class="toolbar-title">Untappd</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-container fluid>
      <div v-if="untappdToken == null">
        <v-card v-if="!isLoggingIn">
          <v-card-title>Sign In To Your Untappd Account</v-card-title>
          <v-card-text>
            To check-in beers directly from this app, sign in to your Untappd
            account below and authorize this app for access.
          </v-card-text>
          <v-card-actions>
            <v-btn @click="logIn()" text color="secondary" class="mt-n3 mb-2"
              >Sign In To Untappd</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card v-if="isLoggingIn && !isTokenError">
          <v-card-title>Untappd Authorization</v-card-title>
          <v-card-text>
            After successfully signing in to Untappd, tap the Continue button
            below.
          </v-card-text>
          <v-card-actions>
            <v-btn
              text
              color="secondary"
              @click="authorize()"
              class="mt-n3 mb-2"
              >Continue</v-btn
            >
            <v-btn @click="isLoggingIn = false" class="ml-5 mt-n3 mb-2" text
              >Cancel</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card v-if="isTokenError">
          <v-card-title>Untappd Authorization</v-card-title>
          <v-card-text>
            Oops, we were unable to verify access to your Untappd account.
            Please try signing in again. 
          </v-card-text>
          <v-card-actions>
            <v-btn @click="tryAgain()" color="secondary" text class="mt-n3 mb-2"
              >Try Again</v-btn
            >
          </v-card-actions>
        </v-card>
      </div>
      <div v-if="untappdToken != null && untappdUser != null">
        <v-card>
          <v-list-item>
            <v-list-item-avatar>
              <v-img :src="untappdUser.avatarUrl"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ untappdUser.name }}</v-list-item-title>
              <v-list-item-subtitle
                >@{{ untappdUser.userName }}</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-card-actions class="mt-n1">
            <v-btn text color="secondary" @click="viewCheckIns()"
              >View Check-Ins</v-btn
            >
            <v-btn text @click="logOut()">Log Out</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-container>
    <Snackbar></Snackbar>
  </div>
</template>

<script>
import Snackbar from "@/components/Snackbar";
import { v4 as uuidv4 } from "uuid";
import { API_ROOT, isConnected } from "@/shared.js";

const axios = require("axios").default;

export default {
  created() {
    this.showConnectionError();
  },

  data() {
    return {
      isLoggingIn: false,
      isTokenError: false,
    };
  },

  computed: {
    untappdToken() {
      return this.$store.state.untappdToken;
    },
    untappdUser() {
      return this.$store.state.untappdUser;
    },
    // Show nav menu icon instead of back arrow if navigating to this page from the navigation menu
    isNavigatedTo() {
      if (this.$route.query.nav == "true") return true;
      else return false;
    },
    useDarkTheme() {
      return this.$store.getters.useDarkTheme;
    },
  },

  methods: {
    logIn() {
      this.showConnectionError();

      // Set unique device ID for retrieving API token later
      let uuid = this.$store.state.deviceId;
      if (uuid == null) {
        uuid = uuidv4();
        this.$store.commit("setDeviceId", uuid);
      }
      // Open Untappd login page in new window
      let authUrl = `${API_ROOT}/Untappd/Auth?isMobile=true&deviceId=${uuid}`;
      window.open(authUrl, "_blank");
      this.isLoggingIn = true;
    },

    tryAgain() {
      this.isTokenError = false;
      this.logIn();
    },

    authorize() {
      let uuid = this.$store.state.deviceId;
      let tokenUrl = `${API_ROOT}/Untappd/GetToken?deviceId=${uuid}`;

      axios
        .get(tokenUrl)
        .then((response) => {
          let token = response.data;

          if (token == null) {
            // No token received
            this.isTokenError = true;
            return;
          }

          // Set token in store
          this.$store.commit("setUntappdToken", token);

          // Get user data
          this.getUntappdUser();

          // Go back to previous page if sent here by Check In button
          if (!this.isNavigatedTo) {
            this.$router.go(-1);
          }

          // Reset page state
          this.isTokenError = false;
          this.isLoggingIn = false;

          // Show snackbar confirmation
          this.$store.commit(
            "snackbarText",
            "You are now signed into Untappd.<br>You can check-in beers directly from this app!"
          );
          this.$store.commit("showSnackbar", true);
        })
        .catch((error) => {
          this.isTokenError = true;
          this.showConnectionError();
        });
    },

    getUntappdUser() {
      let userUrl = `${API_ROOT}/Untappd/GetUser?token=${this.untappdToken}`;

      axios.get(userUrl).then((response) => {
        this.$store.commit("setUntappdUserData", response.data);
      });
    },

    viewCheckIns() {
      let profileUrl = `https://untappd.com/user/${this.untappdUser.userName}`;
      window.open(profileUrl, "_blank");
    },

    logOut() {
      this.$store.commit("setDeviceId", null);
      this.$store.commit("setUntappdToken", null);
      this.$store.commit("setUntappdUserData", null);
      window.open("https://untappd.com/logout", "_blank");
    },

    toggleDrawer() {
      this.$store.commit("toggleDrawer");
    },

    async showConnectionError() {
      let connected = await isConnected();
      if (!connected) {
        this.$store.commit(
          "snackbarText",
          "You are currently offline"
        );
        this.$store.commit("showSnackbar", true);
      }
    },

  },

  components: {
    Snackbar,
  },

};
</script>

<style scoped>
</style>