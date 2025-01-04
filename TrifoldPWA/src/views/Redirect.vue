<template>
  <div style="height: 100vh">
    <v-layout justify-center fill-height>
      <v-progress-circular 
        size="64"
        indeterminate
        class="text-center my-auto"
      ></v-progress-circular>
    </v-layout>
  </div>
</template>

<script>
import { API_ROOT } from "@/shared.js";
const axios = require("axios").default;

export default {
  created() {
    let shortcut = this.$route.params.redirect;
    axios
      .get(`${API_ROOT}/Shortcut?shortcut=${shortcut}`)
      .then((response) => {
				let userId = response.data;
				if(userId == null) this.$router.push('/');
        else this.$router.push({ path: `/prost/${userId}` });
      })
      .catch(() => {
        this.$router.push('/');
      });
  },
};
</script>

<style scoped>
</style>