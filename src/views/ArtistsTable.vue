<template>
    <div class="artists-table">
        <i18n path="artistsTable.header" tag="h1">
            <template v-slot:festivalName>
                <a href="https://moers-festival.de">{{$t("general.festivalName")}}</a>
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
                <span v-else-if="props.column.label == 'notes'">
                    {{ $t("artistsTable.notes") }}
                </span>
            </template>
            
            <template slot="table-row" slot-scope="props">
                <b-row v-if="props.column.field == 'links'">
                    <div style="padding:10px" class="artistlinks" cols="1" cols-sm="2" cols-lg="3">
                        <template class="col" v-for="links in props.row.links">
                            <b-button v-for="link in links" :key="link.url"
                                :href="link.url"
                                size="sm"
                                :title="link.htmlTitle"
                                variant="outline-primary"
                                v-b-tooltip.hover>
                                <i v-if="link.faIconClass" :class="link.faIconClass" variant="primary" style="font-size:28px;height:32px;width:32px"></i>
                                <img v-else :src="link.logoUrl" style="height:32px;width:32px"/>
                            </b-button>
                        </template>
                    </div>
                </b-row>
                <div v-else-if="props.column.field == 'instruments'">
                    {{ props.row.instruments.join(", ") }}
                </div>

                <vue-good-table v-else-if="props.column.field == 'concerts'"
                    :columns="innerTableColumns"
                    :rows="props.row.concerts"
                    :sort-options="innerSortOptions"
                    >

                    <template slot="table-row" slot-scope="props">

                        <div v-if="props.column.field == 'starttime'">
                            <span v-if="isTimeEqualZero(props.row.starttime)">
                                {{ dateFormat(props.row.starttime, "isoDate") }}
                            </span>
                            <span v-else>
                                {{ dateFormat(props.row.starttime, "yyyy-dd-mm HH:MM:ss") }}
                            </span>
                        </div>

                        <div v-else>
                            <p>{{props.formattedRow[props.column.field]}}</p>
                        </div>
                    </template>
                </vue-good-table>

                <div v-else-if="props.column.field == 'notes'">
                    {{ props.row.notes ? props.row.notes[locale] : "" }}
                </div>

                <div v-else-if="props.column.field == 'network-link'">
                    <router-link :to="{ path: '/network', query: { firstname: props.row.firstname, surname: props.row.surname }}"
                        :title="$t('general.network')">
                        <b-button size="sm" variant="outline-primary" v-b-tooltip.hover>
                            <i class="fas fa-project-diagram" variant="primary" style="font-size:28px;height:32px;width:32px"></i>
                        </b-button>
                    </router-link>
                </div>

                <div v-else>
                    <p>{{props.formattedRow[props.column.field]}}</p>
                </div>
            </template>

        </vue-good-table>
    </div>
</template>

<style lang="sass">
@import "node_modules/vue-good-table/src/styles/style.scss"
</style>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { VueGoodTable } from "vue-good-table";
import { VueLoading } from "vue-loading-template";

const dateFormat = require('dateformat');

export default {
    name: "ArtistsTable",
    components: {
       VueGoodTable,
       VueLoading
    },
    props: ["page", "perPage"],
    data: () => {
        return {
            debugMode: false,
            innerSortOptions: {
                enabled: true,
                initialSortBy: {field: "starttime", type: "asc"}
            },
            sortOptions: {
                enabled: true,
                initialSortBy: {field: "surname", type: "asc"}
            }
        }
    },
    computed: {

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
                },
                {
                    label: "ID",
                    field: "id",
                    hidden: !this.debugMode
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
                    label: "",
                    field: "network-link"
                },
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
                    sortable: true,
                    sortFn: this.sortSurnames
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
                    label: this.$t("artistsTable.notes"),
                    field: "notes",
                    sortable: false
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
            return this.artists;
        },

        ...mapGetters("gigdata", ["artists", "artistGigs", "artistLinks"]),
        ...mapState("gigdata", ["allMoersFestivalEvents", "currentTablePage", "loading"]),
        ...mapState("i18n", ["i18nComponent", "locale"])
    },
    methods: {

        dateFormat (dateTime, format) {
            return dateFormat(dateTime, format);
        },

        getArtistLinks(firstname, surname) {
            const artistKey = [firstname, surname].join("");
            const artistData = this.artistLinks[artistKey];
            return artistData ? artistData.links : []
        },

        getArtistNotes(firstname, surname) {
            const artistKey = [firstname, surname].join("");
            const artistData = this.artistLinks[artistKey];
            return artistData ? artistData.notes : null;
        },

        isTimeEqualZero(dateTime) {
            return dateFormat(dateTime, "isoTime") === "00:00:00";
        },

        onPageChange(params) {
            this.$router.push(`/table/${params.currentPerPage}/${params.currentPage}`)
        },

        sortSurnames(x, y, col, rowX, rowY) {

            // if both surnames are the same, sort by firstname
            if(x === y) {
                return ("" + rowX.firstname).localeCompare("" + rowY.firstname);
            }

            // sort empty surname entries towards the end of the list
            if(!x) {
                return 1
            }

            if(!y) {
                return -1
            }

            return x.localeCompare(y);
        },

        ...mapActions("gigdata", ["fetchEventsFromApi"]),
        ...mapMutations("gigdata", ["setCurrentTablePage", "setVueGoodTableInstance", "updateVueTablePage"])
    },

    mounted: function() {
        this.setVueGoodTableInstance(this.$refs.vgt);
        this.setCurrentTablePage(this.currentPage);
    },

    watch: {
        page: function(newPageValue) {
            console.log("watch page");
            this.setCurrentTablePage(newPageValue);
            this.updateVueTablePage();
        }
    }
}

</script>