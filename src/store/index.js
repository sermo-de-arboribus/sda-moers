import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const additions = require("../data/additions.json");
const axios = require("axios").default;

export default new Vuex.Store({
  state: {
    allMoersFestivalEvents: null
  },
  mutations: {
    updateEvents(state, data) {
      state.allMoersFestivalEvents = data;
    }
  },
  actions: {
    fetchEventsFromApi({ commit }) {
      axios.get("https://meinmoers.lambdadigamma.com/api/v2/moers-festival/events/all")
        .then(function (response) {
          let events = null;

          if(response.status > 399) {
              events = require("../data/backup.json");
          } else {
              events = response.data.map(ev => {
                  const eventId = ev.id;
                  if(additions[eventId]) {
                      return Object.assign(ev, additions[eventId]);
                  } else {
                      return ev;
                  }
              })
          }
          commit("updateEvents", events);
      })
    }
  },
  modules: {
  }
})
