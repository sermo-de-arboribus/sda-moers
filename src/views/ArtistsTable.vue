<template>
    <div class="artists-table">
        <h1>Künstler:innen beim <a href="https://moers-festival.de">Moers Festival</a></h1>
        <p>Eine Tabelle von <a href="https://twitter.com/fruehlingstag">Kai Weber</a> auf der Basis der offenen Festivaldaten von <a href="https://lambdadigamma.com/">Lennart Fischer</a>.
           Den Anstoß zum Aufsetzen dieser Tabelle gab ein <a href="https://twitter.com/lambdadigamma/status/1266849091503472645?s=20">Tweet</a>. Vorläufig sind
           nur die Daten der Konzerte von 2019 und 2020 enthalten, eine Erweiterung auf ältere Daten ist angestrebt. Auch soll die Datenhaltung 
           und Benutzbarkeit der Seite weiter verbessert werden. Welche Maßnahmen bereits angestrebt sind, lässt sich im <a
           href="https://github.com/sermo-de-arboribus/sda-moers/issues">Issue-Tracker</a> des Code-Repositoriums nachverfolgen.</p>
        <vue-good-table
            :columns="tableColumns"
            :pagination-options="paginationOptions"
            :rows="tableData"
            :sort-options="sortOptions">

            <template slot="table-row" slot-scope="props">
                <b-row v-if="props.column.field == 'links'">
                    <div style="padding:10px" class="artistlinks" cols="1" cols-sm="2" cols-lg="3">
                        <template class="col" v-for="(linkArray, linkKey) in props.row.links">
                            <b-button v-for="link in linkArray" :key="link.url"
                                :href="link.url"
                                size="sm"
                                :title="`${getServiceName(linkKey)}: ${getServiceType(link.type)}`"
                                variant="outline-primary">
                                <i v-if="linkKey == 'homepage'" class="fas fa-home" variant="primary" style="font-size:29px"></i>
                                <img v-else :src="getLogoUrl(linkKey)" style="width:32px"/>
                            </b-button>
                        </template>
                    </div>
                </b-row>
                <div v-else-if="props.column.field == 'instruments'">
                    {{ Array.from(props.row.instruments).sort().join(", ") }}
                </div>

                <vue-good-table v-else-if="props.column.field == 'concerts'"
                    :columns="innerTableColumns"
                    :rows="props.row.concerts"
                    :sort-options="innerSortOptions"
                    >

                </vue-good-table>

                <span v-else>
                    {{props.formattedRow[props.column.field]}}
                </span>
            </template>

        </vue-good-table>
    </div>
</template>

<style lang="sass">
@import "node_modules/vue-good-table/src/styles/style.scss";
</style>

<script>
import { mapActions, mapState } from "vuex";
import { VueGoodTable } from "vue-good-table";

const artistlinks = require("../data/artistlinks.json");

export default {
    name: "ArtistsTable",
    components: {
       VueGoodTable
    },
    data: () => {
        return {
            innerSortOptions: {
                enabled: true,
                initialSortBy: {field: "starttime", type: "asc"}
            },
            innerTableColumns: [
                {
                    label: "Konzert",
                    field: "concert",
                    width: "50%"
                },
                {
                    label: "Instrument(e)",
                    field: "instruments",
                    sortable: false,
                    width: "15%"
                },
                {
                    label: "Jahr",
                    field: "year",
                    type: "number",
                    width: "10%"
                },
                {
                    label: "Startzeit",
                    field: "starttime",
                    type: "date",
                    dateInputFormat: "yyyy-MM-dd HH:mm:ss",
                    dateOutputFormat: "yyyy-MM-dd HH:mm:ss",
                    width: "25%"
                }
            ],
            paginationOptions: {
                allLabel: "alle",
                enabled: true,
                mode: "pages",
                nextLabel: "weiter",
                ofLabel: "von",
                pageLabel: "Seite",
                perPage: 25,
                perPageDropdown: [25, 50, 100, 200],
                prevLabel: "zurück",
                rowsPerPageLabel: "Zeilen pro Seite"

            },
            sortOptions: {
                enabled: true,
                initialSortBy: {field: "surname", type: "asc"}
            },
            tableColumns: [
                {
                    label: "Vorname",
                    field: "firstname",
                    filterOptions: {
                        enabled: true,
                        placeholder: "Filtere nach Vornamen"
                    },
                },
                {
                    label: "Nachname",
                    field: "surname",
                    filterOptions: {
                        enabled: true,
                        placeholder: "Filtere nach Nachnamen"
                    },
                },
                {
                    label: "Instrument(e)",
                    field: "instruments",
                    filterOptions: {
                        enabled: true,
                        placeholder: "Instrumentenfilter",
                        filterFn: (data, filterString) => {
                            return data.has(filterString);
                        }
                    }
                },
                {
                    label: "Konzerte",
                    field: "concerts",
                    sortable: false,
                    filterOptions: {
                        enabled: true,
                        placeholder: "Konzertfilter",
                        filterFn: (data, filterString) => {
                            console.log(data, filterString);
                            return data.some(g => g.concert.includes(filterString)) || data.some(g => g.year.includes(filterString));
                        }
                    }
                },
                {
                    label: "Links",
                    field: "links",
                    sortable: false,
                    width: "16%"
                }
            ]
        }
    },
    computed: {
        artistGigs: function () {
            if(this.allMoersFestivalEvents) {
                return this.allMoersFestivalEvents.reduce((aggregator, event) => {
                    const parsedEventDescription = cleanUpDescriptions(event.description);
                    const eventLineUp = parsedEventDescription ? parsedEventDescription[1] : "";
                    const artists = eventLineUp
                                        .split(/\)\s*,\s*/)
                                        .filter(a => a)
                                        .map(a => a + ")")
                                        .map(a => {
                                            const parsedArtist = a.match(/(.+?)\s+([\S]*)\s*\(([^)]+)\)/) || "";
                                            const instruments = parsedArtist ? parsedArtist[parsedArtist.length - 1].trim() : "";
                                            const surname = parsedArtist ? parsedArtist[parsedArtist.length - 2].trim() : "";
                                            const firstname = parsedArtist.length > 2 ? parsedArtist.slice(1, parsedArtist.length - 2).join(""): "";
                                            return makeArtistNameCanonical({ instruments, surname, firstname });
                                        });
                    const eventId = event.id;
                    const eventName = event.name;
                    const eventStartDate = event.start_date;
                    const eventEndDate = event.end_date;
                    const year = eventStartDate.substr(0,4);
                    artists.forEach(a => {
                        aggregator.push({ artist: a, eventId, eventName, eventStartDate, eventEndDate, year})
                    });
                    return aggregator;
                }, [])
            } else {
                return [];
            }            
        },

        tableData: function() {
            const gigsGroupedByArtist = this.artistGigs
                .reduce((agg, gig) => {
                    const key = `${gig.artist.firstname}${gig.artist.surname}`;
                    agg[key] = agg[key] || 
                        {
                            "firstname": gig.artist.firstname,
                            "surname": gig.artist.surname,
                            "links": getArtistLinks([gig.artist.firstname, gig.artist.surname].join(""))
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
                    return gigsGroupedByArtist[key]
                });

        },

        ...mapState(["allMoersFestivalEvents"])
    },
    methods: {
        getLogoUrl(serviceKey) {
            switch(serviceKey) {
                case "allaboutjazz": return "/aaj-logo.jpg";
                case "allmusic": return "/allmusic-logo.png";
                case "bandcamp": return "/bandcamp-button-bc-circle-aqua-32.png";
                case "discogs": return "/discogs-logo.png";
                case "soundcloud": return "https://w.soundcloud.com/icon/assets/images/orange_white_32-94fc761.png";
                case "twitter": return "/Twitter_Logo_Blue.png";
                case "youtube": return "/youtube_social_squircle_red.png";
                default: return "";
            }
        },

        getServiceName(serviceKey) {
            switch(serviceKey) {
                case "allaboutjazz": return "All About Jazz";
                case "allmusic": return "Allmusic";
                case "bandcamp": return "Bandcamp";
                case "discogs": return "Discogs";
                case "homepage": return "Homepage";
                case "soundcloud": return "Soundcloud";
                case "twitter": return "Twitter";
                case "youtube": return "Youtube";
                default: return "";
            }
        },

        getServiceType(typeKey) {
            switch(typeKey) {
                case "agency": return "Agentur";
                case "album": return "Album";
                case "band": return "Band";
                case "personal": return "persönliche Seite";
                default: return "";
            }
        },

        ...mapActions(["fetchEventsFromApi"])
    },
    created: function() {
        this.fetchEventsFromApi();
    }
}

function cleanUpDescriptions(sourceDescription) {
    if(!sourceDescription) {
        return "";
    }

    let eventDescription = sourceDescription
        .replace(/[\s\u2028]+/g, " ")
        .replace(/Besetzung:\s+Besetzung:/, "Besetzung: ")
        .replace(/Blumenthal \(leader\)\s*Niels Klein Trio:/, "Blumenthal (leader), ")
        .replace(/Besetzung:\s*EOS Kammerorchester K\u00f6ln:/, "Besetzung: " )
        .replace(/\(dance\) und Dolf Planteijdt/, "(dance), Dolf Planteijdt")
        .replace(/&amp; Teile des Landesjugendorchester NRW: /, ", ")
        .replace(/Produktinformation(en)?: (.+)Herstellungsland.+$/, "Besetzung: $2");

    return eventDescription.match(/Besetzung:\s*(.+)$/);

}

function getArtistLinks(artistname) {
    if(artistlinks[artistname]) {
        return artistlinks[artistname].links;
    } else {
        return { "bandcamp": [], "discogs": [], "twitter": []};
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

</script>