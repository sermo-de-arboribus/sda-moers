import Vue from "vue"
import VueRouter from "vue-router"
import ArtistsTable from "../views/ArtistsTable.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/export",
    name: "Export",
    component: () => import(/* webpackChunkName: "export" */ "../views/Export.vue")
  },
  {
    path: "/network",
    name: "Network",
    component: () => import(/* webpackChunkName: "network" */ "../views/ArtistNetwork.vue")
  },
  {
    path: "/:perPage?/:page?",
    name: "Home",
    props: true,
    component: ArtistsTable
  }
]

const router = new VueRouter({
  mode: "history",
  base: "/moers-festival",
  routes
})

export default router
