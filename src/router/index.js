import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter);

const routes = [
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "main" */ "../views/AboutPage.vue")
  },
  {
    path: "/export",
    name: "Export",
    component: () => import(/* webpackChunkName: "main" */ "../views/ExportPage.vue")
  },
  {
    path: "/network",
    name: "Network",
    component: () => import(/* webpackChunkName: "network" */ "../views/ArtistNetwork.vue")
  },
  {
    path: "/table/:perPage?/:page?",
    name: "Table",
    props: true,
    component: () => import(/* webpackChunkName: "table" */ "../views/ArtistsTable.vue")
  },
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "main" */ "../views/HomePage.vue")
  }
]

const router = new VueRouter({
  mode: "history",
  base: "/moers-festival",
  routes
})

export default router
