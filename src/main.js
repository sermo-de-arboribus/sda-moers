import Vue from "vue"
import App from "./App.vue"
import { BootstrapVue } from "bootstrap-vue"
//import VueI18n from "vue-i18n"

import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import "@fortawesome/fontawesome-free/css/all.css"
import router from "./router"
import store from "./store"

// call with I18n option
/*const messages = {
    cs: {  },
    de: {  },
    en: {  },
    zh: {  }
};*/

Vue.config.productionTip = false

/*const i18n = new VueI18n({
  locale: "de",
  messages
});*/

// Install BootstrapVue
Vue.use(BootstrapVue);
//Vue.use(i18n);

new Vue({
//  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
