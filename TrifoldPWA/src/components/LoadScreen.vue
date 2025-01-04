<template>
  <div style="height: 100vh">
    <v-layout justify-center fill-height>
      <v-progress-circular 
	  	v-if="event == null" 
        size="64"
        indeterminate
        class="text-center my-auto"
      ></v-progress-circular>
	  <v-img v-else contain :src="event.EventImageUrl" max-width="80vw" max-height="80vh" class="flex-grow-0"></v-img>
    </v-layout>
  </div>
</template>

<script>
export default {
  computed: {
    event() {
      return this.$store.state.event;
    },
  },
};
</script>
