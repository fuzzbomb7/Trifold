<template>
  <div>
    <transition name="fade">
      <LoadScreen v-if="showSplashScreen == true"></LoadScreen>
    </transition>
    <template v-if="showSplashScreen == false">
      <NavMenu></NavMenu>
      <v-main>
        <router-view></router-view>
      </v-main>
      <SmsModal></SmsModal>
    </template>
  </div>
</template>

<script>
import { startupModules } from "@/shared.js";
import LoadScreen from "@/components/LoadScreen";
import NavMenu from "@/components/NavMenu";
import SmsModal from "@/components/SmsModal.vue";

export default {
  async created() {
    // Show splash screen on startup
    this.showSplashScreen = true;

    // Store eventId from URL, grab event data from server
    let getEventId = this.$route.params.eventId;

    if (this.eventId != getEventId) {
      this.$store.commit("setEventId", getEventId);
      await this.$store.dispatch("getEvent", getEventId);
    }

    // Set colors
    this.$vuetify.theme.themes.light.primary = this.event.PrimaryColor;
    this.$vuetify.theme.themes.light.secondary = this.event.SecondaryColor;
    this.$vuetify.theme.themes.light.anchor = this.event.SecondaryColor;

    // Set page title
    window.document.title = this.event.EventName;

    // Get map to cache for later
    fetch(this.event.MapUrl, {mode: 'no-cors'});

    // Fade out splashscreen after two seconds
    setTimeout(() => {
      this.showSplashScreen = false;

      // For future use. Determine startup module based on modules chosen
      let modules = this.event.Modules;
      if (
        modules.includes(startupModules.BEER) &&
        this.$route.path == `/prost/${getEventId}`
      ) {
        this.$router.push({
          name: "beer",
          params: { eventId: getEventId },
        });
      }

      // Show SMS modal if applicable
      this.showSmsModalOnDesktop();
    }, 2000);
  },

  computed: {
    event() {
      return this.$store.state.event;
    },
    eventId() {
      return this.$store.state.eventId;
    },
    showSmsModal() {
      return this.$store.state.showSmsModal;
    },
    showSmsModalOnStartup() {
      return this.$store.state.showSmsModalOnStartup;
    },
  },

  components: {
    LoadScreen,
    NavMenu,
    SmsModal,
  },

  data() {
    return {
      showSplashScreen: false,
    };
  },

  methods: {
    showSmsModalOnDesktop() {
      // Only show modal once
      if (this.showSmsModalOnStartup == false) return;

      // Check for desktop user agent
      let userAgent = navigator.userAgent;
      if (
        userAgent.includes("Windows") ||
        userAgent.includes("Macintosh") ||
        userAgent.includes("CrOS")
      ) {
        setTimeout(() => {
          // Show SMS modal
          this.$store.commit("showSmsModal", true);
          this.$store.commit("showSmsModalOnStartup");
        }, 6000);
      }
    },
  },
};
</script>

