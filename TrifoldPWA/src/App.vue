<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {};
</script>

<!-- Global CSS Styles -->
<style>
.drink-header {
  font-size: 0.9375rem;
  font-weight: 500;
  padding-bottom: 2px;
  line-height: 1.2;
}

.drink-subheader {
  font-size: 	0.8125rem;
  font-weight: 400;
  padding-bottom: 3px;
  line-height: 1.2;
}

.drink-caption {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.2;
}

label.v-label {
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 4px;
}

.toolbar-title {
  font-size: 1.125rem !important;
  font-weight: 400 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
