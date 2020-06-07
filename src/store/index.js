import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    i18n: require("./i18n"),
    gigdata: require("./gigdata")
  }
});

