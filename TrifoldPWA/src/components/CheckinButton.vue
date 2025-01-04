<template>
  <v-btn text small @click="checkIn()">
    <template v-if="toggle"
      ><v-icon left color="green">mdi-check-bold</v-icon>Checked In</template
    >
    <template v-else
      ><v-icon left color="grey">mdi-check-bold</v-icon>Check In</template
    >
  </v-btn>
</template>

<script>
import { isConnected } from "@/shared.js";

export default {
  created() {
    this.toggle = this.checkIns.includes(this.id);
  },

  props: ["id"],

  data() {
    return {
      toggle: false,
    };
  },

  watch: {
    checkIns(newValue, oldValue) {
      this.toggle = this.checkIns.includes(this.id);
    }
  },

  computed: {
    checkIns() {
      return this.$store.state.checkIns;
    },
    untappdToken() {
      return this.$store.state.untappdToken;
    },
  },

  methods: {
    async checkIn() {
      if (this.toggle == true) return;
      else if (this.untappdToken == null) {
        // Redirect to Untappd login page
        this.$router.push("untappd");
      } else {
        // Set Untappd beer ID and show check-in modal
        this.$store.commit("checkInBeer", this.id);
        // Connectivity check
        let connected = await isConnected();
        if (!connected) {
          this.$store.commit("snackbarText", "You are currently offline");
          this.$store.commit("showSnackbar", true);
        }
      }
    },
  },
};
</script>

<style scoped>
</style>