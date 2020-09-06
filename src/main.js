import Vue from "vue"
import App from "./App.vue"
import { BootstrapVue } from "bootstrap-vue"
import VueHeadful from 'vue-headful';

import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import "@fortawesome/fontawesome-free/css/all.css"
import router from "./router"
import store from "./store"
import i18n from "./i18n"

Vue.config.productionTip = false
Vue.component("vue-headful", VueHeadful);

// Install BootstrapVue
Vue.use(BootstrapVue);

new Vue({
  router,
  store,
  i18n,
  created() {
    // initialize gig data in vuex store
    this.$store.dispatch("gigdata/fetchEventsFromApi", function() {});

    // inject i18n into store
    store.commit("i18n/setI18nComponent", i18n);
    // detect preferred user languages, then set i18n accordingly
    const navigatorLanguage = navigator.language.substr(0,2);
    const availableLocales = new Set(["cs", "de", "en", "fr", "zh"]);
    const navigatorLanguages = navigator.languages ? navigator.languages : [];
    const preferredLanguages = navigatorLanguages.map(l => { return l.substr(0,2) }).reverse()
    const locale = preferredLanguages.reduce((acc, lang) => {
        if (availableLocales.has(lang)) {
            acc = lang;
        }
        return acc;
     }, navigatorLanguage);
     if (availableLocales.has(locale) && !store.state.i18n.localeSetByBrowserPreference) {
        store.commit("i18n/setLocale", locale)
        store.commit("i18n/setLocaleSetByBrowserPreference", true);
     } else {
         // default locale is set in constructor of i18n via vuex store's default value
     }
  },
  render: h => h(App)
}).$mount("#app");
