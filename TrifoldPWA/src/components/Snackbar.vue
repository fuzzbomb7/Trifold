<template>
  <v-snackbar app bottom multi-line  timeout="4000" v-model="showSnackbar">
    <span v-html="snackbarText"></span>
    <template v-slot:action="{ attrs }">
      <v-btn text color="yellow darken-3" v-bind="attrs" @click="showSnackbar = false"> OK </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  computed: {
    showSnackbar: {
      get() {
        return this.$store.state.showSnackbar;
      },
      set(val) {
        this.$store.commit("showSnackbar", val);
      },
    },
    snackbarText() {
      return this.$store.state.snackbarText;
    },
  },
};
</script>

<style scoped>
</style>