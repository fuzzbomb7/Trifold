import Vue from 'vue'
import VueRouter from 'vue-router'
import Beer from '@/views/Beer.vue'
import Prost from '@/views/Prost.vue'
import Map from '@/views/Map.vue'
import Untappd from '@/views/Untappd.vue'
import About from '@/views/About.vue'
import Home from '@/views/Home.vue'
import Redirect from '@/views/Redirect.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/:redirect",
    component: Redirect
  },
  {
    path: "/prost/:eventId",
    component: Prost,
    children: [
      {
        path: "beer",
        name: "beer",
        component: Beer,
      },
      {
        path: "map",
        component: Map
      },
      {
        path: "map/:x/:y/:loc",
        component: Map
      },
      {
        path: "untappd",
        component: Untappd
      },
      {
        path: 'about',
        component: About,
      },
    ]
  },
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
