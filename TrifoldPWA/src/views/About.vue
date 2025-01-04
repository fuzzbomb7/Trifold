<template>
  <div>
    <v-app-bar color="primary" :dark="useDarkTheme" dense>
      <v-app-bar-nav-icon @click.stop="toggleDrawer" />
      <v-toolbar-title class="toolbar-title">About</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-container fluid>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class=text-h6>{{ event.EventName }}</v-list-item-title>
          <v-list-item-subtitle class="text-subtitle-1"
            ><a href="event.EventUrl">{{
              event.EventUrl
            }}</a></v-list-item-subtitle
          >
					<div class="mt-3 caption font-weight-bold">Prost! The Beer Festival App {{version}}</div>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>
      <v-list-item>
        <v-list-item-content>
          <div class="mb-2"><a href="https://trifold.app" style="text-decoration: none">Powered by <img :src="`/img/trifold.png`" height="16" style="margin: 0 0 -2px 1px"></img></a></div>
          <div>
            Beer data courtesy of <a href="https://untappd.com" style="color:#cc6600; text-decoration: none; font-weight: bold">Untappd</a>
          </div>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item>
        <v-list-item-content>
          <div class="mb-2"><a href="https://trifold.app">Privacy Policy</a></div>
          <div><a href="https://trifold.app">Technical Support</a></div>
        </v-list-item-content>
      </v-list-item>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      publicPath: process.env.BASE_URL,
      version: process.env.PACKAGE_VERSION,
    };
  },

  computed: {
    event() {
      return this.$store.state.event;
    },
    useDarkTheme() {
      return this.$store.getters.useDarkTheme;
    },
  },

  methods: {
    toggleDrawer() {
      this.$store.commit("toggleDrawer");
    },
  },
};
</script>

<style scoped>
.link {
  margin: 4px 0 4px 16px;
}
</style>