<template>
    <div class="artists-table">
        <h1>Künstler:innen beim <a href="https://moers-festival.de">Moers Festival</a></h1>
        <p>Eine Tabelle von <a href="https://twitter.com/fruehlingstag">Kai Weber</a> auf der Basis der offenen Festivaldaten von <a href="https://lambdadigamma.com/">Lennart Fischer</a>.
           Den Anstoß zum Aufsetzen dieser Tabelle gab ein <a href="https://twitter.com/lambdadigamma/status/1266849091503472645?s=20">Tweet</a>. Vorläufig sind
           nur die Daten der Konzerte von 2020 enthalten, eine Erweiterung auf die Daten von 2019 ist angestrebt.</p>
        <vue-bootstrap-table
            :columns="tableColumns"
            defaultOrderColumn="Nachname"
            :paginated="true"
            :pageSize="25"
            :values="tableData"
            :show-filter="true"
            :selectable="false"
            :sortable="true"
            :multi-column-sortable="true">

        </vue-bootstrap-table>
        <!--<ul>
            <li v-for="gig in artistGigs" :key="`${gig.artist.surname}_${gig.eventId}`">
                [{{gig.year}}] {{ gig.artist.surname }}, {{ gig.artist.firstname }} ({{gig.artist.instruments}}): {{ gig.eventName }}
            </li>
        </ul>-->
    </div>
</template>

<script>
import VueBootstrapTable from "vue2-bootstrap-table2";

const axios = require("axios").default;
const additions = require("../data/additions.json");

export default {
    name: "ArtistsTable",
    components: {
       VueBootstrapTable
    },
    data: () => {
        return {
            allMoersFestivalEvents: [],
            tableColumns: [
                {
                    title: "Jahr"
                },
                {
                    title: "Vorname"
                },
                {
                    title: "Nachname"
                },
                {
                    title: "Instrument(e)"
                },
                {
                    title: "Konzert"
                },
                {
                    title: "Startzeit"
                },
                {
                    title: "Event-ID",
                    visible: false
                }
            ]
        }
    },
    computed: {
        artistGigs: function () {
            if(this.allMoersFestivalEvents) {
                return this.allMoersFestivalEvents.reduce((aggregator, event) => {
                    const eventDescription = event.description || "";
                    const parsedEventDescription = eventDescription.match(/Besetzung:( Besetzung:)?\s*(.+)$/);
                    const eventLineUp = parsedEventDescription ? parsedEventDescription[2] : "";
                    const artists = eventLineUp
                                        .split(/\)\s*,\s*/)
                                        .filter(a => a)
                                        .map(a => a + ")")
                                        .map(a => {
                                            const parsedArtist = a.match(/(.+?)\s+(.*)\s*\(([^)]+)\)/) || "";
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
                    "Jahr": ag.year,
                    "Vorname": ag.artist.firstname,
                    "Nachname": ag.artist.surname,
                    "Instrument(e)": ag.artist.instruments,
                    "Konzert": ag.eventName,
                    "Startzeit": ag.eventStartDate,
                    "Event-ID": ag.eventId
                }
            });
        }
    },
    created: function() {
        console.log("fetching data from Moers API");
        const vueInstance = this;
        axios.get("https://meinmoers.lambdadigamma.com/api/v2/moers-festival/events/all")
            .then(function (response) {
                const events = response.data.map(ev => {
                    const eventId = ev.id;
                    if(additions[eventId]) {
                        return Object.assign(ev, additions[eventId]);
                    } else {
                        return ev;
                    }
                })

                vueInstance.allMoersFestivalEvents = events;
            })
    }
}
</script>