// import i18n from "../i18n"

const additions = require("../data/additions.json");
const artistlinks = require("../data/artistlinks.json");
const legacyGigData = require("../data/legacy-gigs.json");
// const axios = require("axios").default;

module.exports = {
    namespaced: true,
    state: {
        allMoersFestivalEvents: null,
        currentTablePage: 1,
        loading: false,
        useRemoteApi: true,
        vueGoodTableInstance: null
    },
    mutations: {
        setCurrentTablePage(state, page) {
            state.currentTablePage = page;
        },

        setLoading(state, value) {
            state.loading = value;
        },

        setVueGoodTableInstance(state, vgt) {
            state.vueGoodTableInstance = vgt;
        },

        updateEvents(state, data) {

            const events = data.map(event => {
                const parsedEventDescription = cleanUpDescriptions(event.description);
                let eventLineUp = parsedEventDescription ? parsedEventDescription[1] : "";
                eventLineUp = eventLineUp.replace(/\r\n/, " ")
                const artists = event.artists && event.artists.length
                    ? event
                        .artists
                        .map(a => {
                            if(!a) return null;
                            else return parseArtist(a.replace(/Besetzung:\s*/, ""));
                        })
                        .filter(a => a)
                    : eventLineUp
                        .split(/\)\s*,\s*/)
                        .filter(a => a)
                        .map(a => a + ")")
                        .map(a => {
                            if(!a) {
                                console.error()
                            }
                            return parseArtist(a);
                        });
                return Object.assign(event, { artists });
            })

            state.allMoersFestivalEvents = events;
        },

        updateVueTablePage(state) {
            const page = state.currentTablePage;
            if(state.vueGoodTableInstance) {
                console.log("updating vue table page to page " + page);
                state.vueGoodTableInstance.changePage(parseInt(page));    
            }
        }
    },
    actions: {
        fetchEventsFromApi({ commit /*, state */ }) {

            commit("setLoading", true);

            let events = null;

            /*if(state.useRemoteApi) {
                axios.get("https://meinmoers.lambdadigamma.com/api/v2/moers-festival/events/all")
                    .then(function (response) {
                        events = addAdditionalData(response.data);
                        commit("updateEvents", events);
                        console.log("fetched events from API");
                        commit("updateVueTablePage");
                        commit("setLoading", false);
                })
            } else { */
                events = [...addAdditionalData(require("../data/backup-2021-04-14.json")), ...require("../data/2021.json"), ...require("../data/2022.json")];
                commit("updateEvents", events);
                console.log("fetched events from local backup");
                commit("updateVueTablePage");
                commit("setLoading", false);
            /*}*/
        }
    },
    getters: {
        artists: function(state, getters) {
            const gigsGroupedByArtist = getters.artistGigs
                .reduce((agg, gig) => {
                    const key = `${gig.artist.firstname}${gig.artist.surname}`;
                    agg[key] = agg[key] || 
                        {
                            "firstname": gig.artist.firstname,
                            "surname": gig.artist.surname,
                            "links": getArtistLinks(getters.artistLinks, gig.artist.firstname, gig.artist.surname),
                            "notes": getArtistNotes(getters.artistLinks, gig.artist.firstname, gig.artist.surname)
                        };
                    agg[key].concerts = agg[key].concerts || [];   
                    agg[key].concerts.push({
                        "year": gig.year,
                        "instruments": gig.artist.instruments,
                        "concert": gig.eventName,
                        "starttime": gig.eventStartDate,
                        "id": gig.eventId
                    })
                    agg[key].instruments = agg[key].instruments || new Set();
                    gig.artist.instruments
                        .split(",")
                        .map(i => i.trim())
                        .forEach(i => agg[key].instruments.add(i));

                    return agg;
                }, {});            

            return Object.keys(gigsGroupedByArtist)
                .map(key => {
                    gigsGroupedByArtist[key].instruments = Array.from(gigsGroupedByArtist[key].instruments).sort();
                    return gigsGroupedByArtist[key]
                });
        },

        artistGigs: function (state) {
            if(state.allMoersFestivalEvents) {
                return state.allMoersFestivalEvents.reduce((aggregator, event) => {

                    const eventStartDate = event.start_date;
                    const year = eventStartDate.substr(0,4);
                    event.artists.forEach(a => {
                        aggregator.push({
                            artist: a, 
                            eventDescriptionDE: event.description,
                            eventDescriptionEN: event.extras ? event.extras.descriptionEN : null,
                            eventId: event.id,
                            eventName: event.name,
                            eventStartDate,
                            eventEndDate: event.end_date,
                            year})
                    });
                    return aggregator;
                }, [])
            } else {
                return [];
            }            
        },

        artistLinks: function(_a, _b, rootState) {
            
            const al = {}

            Object.keys(artistlinks).forEach(akey => {

                al[akey] = {};
                
                if (artistlinks[akey].canonicalName) {
                    al[akey].canonicalName = artistlinks[akey].canonicalName
                }

                if (artistlinks[akey].links) {
                    const artistKeys = Object.keys(artistlinks[akey].links);
                    try {
                        al[akey].links = artistKeys.reduce((acc, l) => {

                            let links = [];
                            for (const link of artistlinks[akey].links[l]) {
    
                                let faIconClass;
                                switch(l) {
                                    case "homepage": 
                                        faIconClass = "fas fa-home";
                                        break;
                                    case "wikipedia": 
                                        faIconClass = "fab fa-wikipedia-w"
                                        break;
                                    default:
                                        break;
                                }
    
                                if (link.locales && link.locales.find(l => l.locale == rootState.i18n.locale)) {
    
                                    links.push({
                                        faIconClass,
                                        htmlTitle: `${getServiceName(l)}: ${getServiceType(link.type, rootState.i18n.i18nComponent)}`,
                                        logoUrl: getLogoUrl(l),
                                        type: link.type, 
                                        url: link.locales.find(l => l.locale == rootState.i18n.locale).url
                                    });
                                } else if (link.url) {
                                    link.faIconClass = faIconClass;
                                    link.htmlTitle= `${getServiceName(l)}: ${getServiceType(link.type, rootState.i18n.i18nComponent)}`;
                                    link.logoUrl = getLogoUrl(l)
                                    links.push(link);
                                } else {
                                    return acc;
                                }
                            }
    
                            return Object.assign(acc, {[l]: links});
                        }, {});
                    } catch (err) {
                        console.error("Error! Could not process artist links with key ", akey);
                    }
                }

                if (artistlinks[akey].notes) {
                    al[akey].notes = artistlinks[akey].notes;
                }
            })

            return al;
        }
    }
}

function addAdditionalData(events) {
    const updatedEvents = events.map(ev => {
      const eventId = ev.id;
      if(additions[eventId]) {
          return Object.assign(ev, additions[eventId]);
      } else {
          return ev;
      }
    });

    return [...updatedEvents, ...legacyGigData]
}

function cleanUpDescriptions(sourceDescription) {
  if(!sourceDescription) {
    return "";
  }

  const eventDescription = sourceDescription
    .replace(/[\s\u2028]+/g, " ")
    .replace(/Besetzung:\s+Besetzung:/, "Besetzung: ")
    .replace(/Blumenthal \(leader\)\s*Niels Klein Trio:/, "Blumenthal (leader), ")
    .replace(/Besetzung:\s*EOS Kammerorchester K\u00f6ln:/, "Besetzung: " )
    .replace(/\(dance\) und Dolf Planteijdt/, "(dance), Dolf Planteijdt")
    .replace(/&amp; Teile des Landesjugendorchester NRW: /, ", ")
    .replace(/Produktinformation(en)?: (.+)Herstellungsl[aä]nd(er)?.+$/, "Besetzung: $2")
    .replace(/[Ll]ine-[Uu]p:\s*/, "Besetzung: ");

  return eventDescription.match(/Besetzung:\s*(.+)$/);
}

function getArtistLinks(artistLinks, firstname, surname) {
    const artistKey = [firstname, surname].join("");
    const artistData = artistLinks[artistKey];
    return artistData ? artistData.links : []
}

function getArtistNotes(artistLinks, firstname, surname) {
    const artistKey = [firstname, surname].join("");
    const artistData = artistLinks[artistKey];
    return artistData ? artistData.notes : null;
}

function getLogoUrl(serviceKey) {
    switch(serviceKey) {
        case "allaboutjazz": return "/aaj-logo.jpg";
        case "allmusic": return "/allmusic-logo.png";
        case "bandcamp": return "/bandcamp-button-bc-circle-aqua-32.png";
        case "discogs": return "/discogs-logo.png";
        case "jazzsession": return "/tjs-squarelogo.jpg";
        case "radiohoerer": return "/radio-icon.png";
        case "soundcloud": return "https://w.soundcloud.com/icon/assets/images/orange_white_32-94fc761.png";
        case "twitter": return "/Twitter_Logo_Blue.png";                
        case "youtube": return "/youtube_social_squircle_red.png";
        default: return "";
    }
}

function getServiceName(serviceKey) {
    switch(serviceKey) {
        case "allaboutjazz": return "All About Jazz";
        case "allmusic": return "Allmusic";
        case "bandcamp": return "Bandcamp";
        case "discogs": return "Discogs";
        case "homepage": return "Homepage";
        case "jazzsession": return "The Jazz Session";
        case "radiohoerer": return "Radiohörer @ Friends of Alan";
        case "soundcloud": return "Soundcloud";
        case "twitter": return "Twitter";
        case "wikipedia": return "Wikipedia";
        case "youtube": return "Youtube";
        default: return "";
    }
}

function getServiceType(typeKey, i18n) {
    switch(typeKey) {
        case "agency": return i18n.t("artistsTable.serviceTypes.agency");
        case "album": return i18n.t("artistsTable.serviceTypes.album");
        case "band": return i18n.t("artistsTable.serviceTypes.band");
        case "interview": return i18n.t("artistsTable.serviceTypes.interview");
        case "personal": return i18n.t("artistsTable.serviceTypes.personal");
        case "search": return i18n.t("artistsTable.serviceTypes.search");
        default: return "";
    }
}

function makeArtistNameCanonical({instruments, firstname, surname}) {
    const artistLink = artistlinks[[firstname, surname].join("")];
    if(artistLink && artistLink.canonicalName) {
        firstname = artistLink.canonicalName.firstname;
        surname = artistLink.canonicalName.surname;
    }
    return {instruments, firstname, surname}
}

function parseArtist(a) {
    const parsedArtist = a.match(/(.+?)\s+([\S]*)\s*\(([^)]+)\)/) || "";
    const instruments = parsedArtist ? parsedArtist[parsedArtist.length - 1].trim() : "";
    const surname = parsedArtist ? parsedArtist[parsedArtist.length - 2].trim() : "";
    const firstname = parsedArtist.length > 2 ? parsedArtist.slice(1, parsedArtist.length - 2).join("") : "";
    return makeArtistNameCanonical({ instruments, surname, firstname });
}