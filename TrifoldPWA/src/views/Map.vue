<template>
  <div>
    <v-app-bar color="primary" :dark="useDarkTheme" dense>
      <v-app-bar-nav-icon v-if="isLocation">
        <template v-slot:default>
          <v-icon @click="$router.go(-1)">mdi-arrow-left</v-icon>
        </template>
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon v-else @click.stop="toggleDrawer" />
      <v-toolbar-title class="toolbar-title"
        >Map - {{ event.EventName }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
    </v-app-bar>
    <div v-if="noMap" class="h6 font-weight-medium text-center mt-5 grey--text">
      No map uploaded
    </div>
    <div id="map"></div>
  </div>
</template>

<script>
import L from "leaflet";

export default {
  data() {
    return {
      map: null,
      markers: null,
      noMap: false,
    };
  },

  mounted() {
    // Map
    var zoomIncrement = 0.5;

    if (this.event.MapUrl) {
      this.map = L.map("map", {
        crs: L.CRS.Simple,
        attributionControl: false,
        zoomDelta: zoomIncrement,
        zoomSnap: zoomIncrement,
      });

      var mapX = this.event.MapWidth;
      var mapY = this.event.MapHeight;
      var bounds = [
        [0, 0],
        [mapY, mapX],
      ];
      L.imageOverlay(this.event.MapUrl, bounds).addTo(this.map);
      this.map.setMaxBounds(bounds);

      // Set max/min zoom
      var mapLargestSide = 0;
      var windowLargestSide = 0;
      var windowSize = this.map.getSize();

      if (mapX >= mapY) {
        mapLargestSide = mapX;
        windowLargestSide = windowSize.x;
      } else {
        mapLargestSide = mapY;
        windowLargestSide = windowSize.y;
      }

      var zoomMult = Math.floor(mapLargestSide / windowLargestSide) + 1;
      var maxZoom = zoomMult * zoomIncrement;

      this.map.setMinZoom(-maxZoom);
      this.map.setMaxZoom(maxZoom);

      var maxBounds = [
        [-mapY / 2, -mapX / 2],
        [mapY * 1.5, mapX * 1.5],
      ];
      this.map.fitBounds(maxBounds);

      // Marker layer group
      this.markers = L.layerGroup().addTo(this.map);

      // Place marker
      this.loadMarker();
      window.onhashchange = this.loadMarker;

      // Hack to prevent Chrome toolbar from hiding app bar
      this.map.on("zoomend", function () {
        window.scrollTo(0, 0);
      });
    } else {
      this.noMap = true;
    }
  },

  computed: {
    isLocation() {
      if (this.$route.params.x == null) return false;
      else return true;
    },
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
    loadMarker() {
      var marker = {
        x: this.$route.params.x,
        y: this.$route.params.y,
        loc: this.$route.params.loc,
      };
      if (marker.x != undefined) this.createMarker(marker);
    },
    createMarker(markerData) {
      var fixedIcon = L.icon({
        iconUrl: "/img/blue-marker.png",
        iconSize: [48, 48],
        iconAnchor: [23, 44],
        popupAnchor: [0, -39],
      });

      this.markers.clearLayers();
      var viewMarker = L.marker([markerData.y, markerData.x], {
        icon: fixedIcon,
      });
      viewMarker.bindPopup(markerData.loc);
      this.markers.addLayer(viewMarker);
      viewMarker.openPopup();
      this.map.setView([markerData.y, markerData.x], 0);
    },
  },
};
</script>

<style scoped>
#map {
  border: none;
  width: 100vw;
  height: calc(100vh - 48px);
  z-index: 0;
}
</style> 