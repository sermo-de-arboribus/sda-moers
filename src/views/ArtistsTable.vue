<template>
    <div class="artists-table">
        <h1>Künstler:innen beim <a href="https://moers-festival.de">Moers Festival</a></h1>
        <p>Eine Tabelle von <a href="https://twitter.com/fruehlingstag">Kai Weber</a> auf der Basis der offenen Festivaldaten von <a href="https://lambdadigamma.com/">Lennart Fischer</a>.
           Den Anstoß zum Aufsetzen dieser Tabelle gab ein <a href="https://twitter.com/lambdadigamma/status/1266849091503472645?s=20">Tweet</a>. Vorläufig sind
           nur die Daten der Konzerte von 2019 und 2020 enthalten, eine Erweiterung auf ältere Daten ist angestrebt.</p>
        <vue-good-table
            :columns="tableColumns"
            :fixed-header="true"
            :pagination-options="paginationOptions"
            :rows="tableData"
            :sort-options="sortOptions">

            <template slot="table-row" slot-scope="props">
                <div v-if="props.column.field == 'links'" class="artistlinks">
                    <div class="discogs">
                        <b-button v-for="link in props.row.links.discogs" :href="link.url" :key="link.url" 
                            :title="`Discogs: ${link.type}`" variant="outline-primary">
                            <img src="/discogs-logo.png"/>
                        </b-button>
                    </div>
                    <div class="twitter">
                        <b-button v-for="link in props.row.links.twitter" :href="link.url" :key="link.url"
                            :title="`Twitter: ${link.type}`" variant="outline-primary">
                            <img src="/Twitter_Logo_Blue.png" style="width:16px"/>
                        </b-button>
                    </div>
                </div>
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
import { VueGoodTable } from 'vue-good-table';

const axios = require("axios").default;
const additions = require("../data/additions.json");
const artistlinks = require("../data/artistlinks.json");

export default {
    name: "ArtistsTable",
    components: {
       VueGoodTable
    },
    data: () => {
        return {
            allMoersFestivalEvents: [],
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
                    label: "Jahr",
                    field: "year",
                    filterOptions: {
                        enabled: true,
                        placeholder: "Filtere nach Jahr"
                    },
                    type: "number",
                    width: "6%"
                },
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
                        placeholder: "Filtere nach Instrumenten"
                    },
                    sortable: false
                },
                {
                    label: "Konzert",
                    field: "concert",
                    filterOptions: {
                        enabled: true,
                        placeholder: "Filtere nach Konzerten"
                    },
                },
                {
                    label: "Startzeit",
                    field: "starttime",
                    type: "date",
                    dateInputFormat: "yyyy-MM-dd HH:mm:ss",
                    dateOutputFormat: "yyyy-MM-dd HH:mm:ss"
                },
                {
                    label: "Links",
                    field: "links",
                    sortable: false
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
                                            return { instruments, surname, firstname }
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
            return this.artistGigs.map(ag => {
                return {
                    "year": ag.year,
                    "firstname": ag.artist.firstname,
                    "surname": ag.artist.surname,
                    "instruments": ag.artist.instruments,
                    "concert": ag.eventName,
                    "starttime": ag.eventStartDate,
                    "id": ag.eventId,
                    "links": getArtistLinks([ag.artist.firstname, ag.artist.surname].join(""))
                }
            });
        }
    },
    created: function() {
        console.log("fetching data from Moers API");
        const vueInstance = this;
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

                vueInstance.allMoersFestivalEvents = events;
            })
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
        return { "discogs": [], "twitter": []};
    }
}

</script>