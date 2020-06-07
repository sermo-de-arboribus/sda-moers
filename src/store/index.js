import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const additions = require("../data/additions.json");
const axios = require("axios").default;

export default new Vuex.Store({
  state: {
    allMoersFestivalEvents: null,
    useRemoteApi: true
  },
  mutations: {
    updateEvents(state, data) {
      state.allMoersFestivalEvents = data;
    }
  },
  actions: {
    fetchEventsFromApi({ commit, state }) {

      let events = null;

      if(state.useRemoteApi) {
        axios.get("https://meinmoers.lambdadigamma.com/api/v2/moers-festival/events/all")
            .then(function (response) {
              events = addAdditionalData(response.data);
              commit("updateEvents", events);
          })
      } else {
        events = addAdditionalData(require("../data/backup.json"));
        commit("updateEvents", events);
      }
    }
  },
  modules: {
  }
});

function addAdditionalData(events) {
  return events.map(ev => {
    const eventId = ev.id;
    if(additions[eventId]) {
        return Object.assign(ev, additions[eventId]);
    } else {
        return ev;
    }
})
}