<template>
    <div class="artists-table">
        <i18n path="artistsTable.header" tag="h1">
            <template v-slot:festivalName>
                <a href="https://moers-festival.de">{{$t("general.festivalName")}}</a>
            </template>
        </i18n>
        <i18n path="artistsTable.intro" tag="p">
            <template v-slot:websiteCreator>
                <a href="https://www.facebook.com/kajetan.tkadlec.9" v-if="locale === 'cs'">Kajetána Tkalce</a>
                <a href="https://twitter.com/fruehlingstag" v-else>Kai Weber</a>
            </template>
            <template v-slot:dataProvider>
                <a href="https://lambdadigamma.com" v-if="locale === 'cs'">Lennarta Fišera</a>
                <a href="https://lambdadigamma.com/" v-else>Lennart Fischer</a>
            </template>
            <template v-slot:tweet>
                <a href="https://twitter.com/lambdadigamma/status/1266849091503472645?s=20">{{$t("general.tweet")}}</a>
            </template>
            <template v-slot:issueTracker>
                <a href="https://github.com/sermo-de-arboribus/sda-moers/issues">{{$t("general.issueTracker")}}</a>
            </template>
        </i18n>
        <vue-loading v-if="loading" type="spin" color="blue"></vue-loading>
        <vue-good-table
            :columns="tableColumns"
            :pagination-options="paginationOptions"
            :rows="tableData"
            :sort-options="sortOptions"
            @on-page-change="onPageChange"
            @on-per-page-change="onPageChange"
            ref="vgt">

            <template slot="table-column" slot-scope="props">
                <span v-if="props.column.label == 'firstname'">
                    Hejoho
                    {{ $t("artistsTable.firstname") }}
                </span>
                <span v-else-if="props.column.label == 'surname'">
                    {{ $t("artistsTable.surname") }}
                </span>
                <span v-else-if="props.column.label == 'instruments'">
                    {{ $t("artistsTable.instruments") }}
                </span>
                <span v-else-if="props.column.label == 'concerts'">
                    {{ $t("artistsTable.concerts") }}
                </span>
            </template>
            
            <template slot="table-row" slot-scope="props">
                <b-row v-if="props.column.field == 'links'">
                    <div style="padding:10px" class="artistlinks" cols="1" cols-sm="2" cols-lg="3">
                        <template class="col" v-for="linkArray in props.row.links">
                            <b-button v-for="link in linkArray" :key="link.url"
                                :href="link.url"
                                size="sm"
                                :title="link.htmlTitle"
                                variant="outline-primary">
                                <i v-if="link.faIconClass" :class="link.faIconClass" variant="primary" style="font-size:28px;height:32px;width:32px"></i>
                                <img v-else :src="link.logoUrl" style="height:32px;width:32px"/>
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
import { VueLoading } from "vue-loading-template";

const artistlinks = require("../data/artistlinks.json");

export default {
    name: "ArtistsTable",
    components: {
       VueGoodTable,
       VueLoading
    },
    props: ["page", "perPage"],
    data: () => {
        return {
            innerSortOptions: {
                enabled: true,
                initialSortBy: {field: "starttime", type: "asc"}
            },
            loading: false,
            sortOptions: {
                enabled: true,
                initialSortBy: {field: "surname", type: "asc"}
            }
        }
    },
    computed: {
        artistGigs: function () {
            if(this.allMoersFestivalEvents) {
                return this.allMoersFestivalEvents.reduce((aggregator, event) => {
                    const parsedEventDescription = cleanUpDescriptions(event.description);
                    let eventLineUp = parsedEventDescription ? parsedEventDescription[1] : "";
                    eventLineUp = eventLineUp.replace(/\r\n/, " ")
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

        artistLinks: function() {
            
            const al = {}

            Object.keys(artistlinks).forEach(akey => {

                al[akey] = {};
                
                if (artistlinks[akey].canonicalName) {
                    al[akey].canonicalName = artistlinks[akey].canonicalName
                }

                if (artistlinks[akey].links) {
                    al[akey].links = Object.keys(artistlinks[akey].links).reduce((acc, l) => {

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

                            if (link.locales && link.locales.find(l => l.locale == this.locale)) {

                                links.push({
                                    faIconClass,
                                    htmlTitle: `${this.getServiceName(l)}: ${this.getServiceType(link.type)}`,
                                    logoUrl: this.getLogoUrl(l),
                                    type: link.type, 
                                    url: link.locales.find(l => l.locale == this.locale).url
                                });
                            } else if (link.url) {
                                link.faIconClass = faIconClass;
                                link.htmlTitle= `${this.getServiceName(l)}: ${this.getServiceType(link.type)}`;
                                link.logoUrl = this.getLogoUrl(l)
                                links.push(link);
                            } else {
                                return acc;
                            }
                        }

                        return Object.assign(acc, {[l]: links});
                    }, {});
                }
            })

            return al;
        },

        currentPage: function() {
            return this.page ? parseInt(this.page) : 1;
        },

        currentPerPage: function() {
            return this.perPage ? parseInt(this.perPage) : 25;
        },

        innerTableColumns: function() {
            return [
                {
                    label: this.$t("artistsTable.concerts"),
                    field: "concert",
                    width: "50%"
                },
                {
                    label: this.$t("artistsTable.instruments"),
                    field: "instruments",
                    sortable: false,
                    width: "15%"
                },
                {
                    label: this.$t("artistsTable.year"),
                    field: "year",
                    type: "number",
                    width: "10%"
                },
                {
                    label: this.$t("artistsTable.starttime"),
                    field: "starttime",
                    type: "date",
                    dateInputFormat: "yyyy-MM-dd HH:mm:ss",
                    dateOutputFormat: "yyyy-MM-dd HH:mm:ss",
                    width: "25%"
                }
            ]
        },

        paginationOptions: function() {
            return {
                allLabel: this.$t("artistsTable.pagination.all"),
                enabled: true,
                mode: "pages",
                nextLabel: this.$t("artistsTable.pagination.nextLabel"),
                ofLabel: this.$t("artistsTable.pagination.ofLabel"),
                pageLabel: this.$t("artistsTable.pagination.pageLabel"),
                perPage: this.currentPerPage,
                perPageDropdown: [25, 50, 100, 200],
                prevLabel: this.$t("artistsTable.pagination.prevLabel"),
                rowsPerPageLabel: this.$t("artistsTable.pagination.rowsPerPageLabel"),
                setCurrentPage: this.currentPage
            }
        },

        tableColumns: function() {
            return [
                {
                    label: this.$t("artistsTable.firstname"),
                    field: "firstname",
                    filterOptions: {
                        enabled: true,
                        placeholder: this.$t("artistsTable.filters.byFirstname")
                    },
                },
                {
                    label: this.$t("artistsTable.surname"),
                    field: "surname",
                    filterOptions: {
                        enabled: true,
                        placeholder: this.$t("artistsTable.filters.bySurname")
                    },
                },
                {
                    label: this.$t("artistsTable.instruments"),
                    field: "instruments",
                    filterOptions: {
                        enabled: true,
                        placeholder: this.$t("artistsTable.filters.byInstruments"),
                        filterFn: (data, filterString) => {
                            return data.has(filterString);
                        }
                    }
                },
                {
                    label: this.$t("artistsTable.concerts"),
                    field: "concerts",
                    sortable: false,
                    filterOptions: {
                        enabled: true,
                        placeholder: this.$t("artistsTable.filters.byConcerts"),
                        filterFn: (data, filterString) => {
                            console.log(data, filterString);
                            return data.some(g => g.concert.includes(filterString)) || data.some(g => g.year.includes(filterString));
                        }
                    }
                },
                {
                    label: this.$t("artistsTable.links"),
                    field: "links",
                    sortable: false,
                    width: "16%"
                }
            ]
        },
        tableData: function() {
            const gigsGroupedByArtist = this.artistGigs
                .reduce((agg, gig) => {
                    const key = `${gig.artist.firstname}${gig.artist.surname}`;
                    agg[key] = agg[key] || 
                        {
                            "firstname": gig.artist.firstname,
                            "surname": gig.artist.surname,
                            "links": this.getArtistLinks(gig.artist.firstname, gig.artist.surname)
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

        ...mapState("gigdata", ["allMoersFestivalEvents"]),
        ...mapState("i18n", ["i18nComponent", "locale"])
    },
    methods: {

        getArtistLinks(firstname, surname) {
            const artistKey = [firstname, surname].join("");
            const artistData = this.artistLinks[artistKey];
            return artistData ? artistData.links : []
        },

        getLogoUrl(serviceKey) {
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
        },

        getServiceName(serviceKey) {
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
        },

        getServiceType(typeKey) {
            switch(typeKey) {
                case "agency": return this.$t("artistsTable.serviceTypes.agency");
                case "album": return this.$t("artistsTable.serviceTypes.album");
                case "band": return this.$t("artistsTable.serviceTypes.band");
                case "personal": return this.$t("artistsTable.serviceTypes.personal");
                case "search": return this.$t("artistsTable.serviceTypes.search");
                default: return "";
            }
        },

        onPageChange(params) {
            this.$router.push(`/${params.currentPerPage}/${params.currentPage}`)
        },

        ...mapActions("gigdata", ["fetchEventsFromApi"])
    },
    created: function() {
        let that = this;
        this.loading = true;
        this.fetchEventsFromApi(() => {
            that.loading = false;
            that.$refs.vgt.changePage(parseInt(that.currentPage));
        });
    }
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
        .replace(/Produktinformation(en)?: (.+)Herstellungsland.+$/, "Besetzung: $2");

    return eventDescription.match(/Besetzung:\s*(.+)$/);

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