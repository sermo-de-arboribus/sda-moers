import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    i18n: require("./i18n"),
    gigdata: require("./gigdata")
  },
  plugins: [createPersistedState({
    key: "sda-moers",
    paths: [
      "i18n.locale",
      "i18n.localeSetByBrowserPreference"
    ]
  })]
});

