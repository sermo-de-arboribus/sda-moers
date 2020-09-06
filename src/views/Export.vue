<template>
    <div class="export">
        <section class="container">
            <h1>{{ $t("exportPage.header") }}</h1>
            <div class="row justify-content-center">
                <div class="col">
                    <a :href="artistsJsonObjectUrl">
                        <button type="button" class="btn btn-primary">JSON</button>
                    </a>
                </div>
                <div class="col">
                    <download-csv :data="flatData" name="moers-artists.csv">
                        <button type="button" class="btn btn-primary">CSV</button>
                    </download-csv>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.btn-toolbar {
    text-align: center;
}

</style>
<script>
import { mapGetters, mapState } from "vuex";
import DownloadCsv from "vue-json-csv";

export default {
    
    name: "Export",
    components: {
        DownloadCsv
    },

    computed: {

        artistsJsonBlob() {
            if(this.artists && this.artists.length) {
                const jsonString = JSON.stringify(this.artists, undefined, 2);
                const blob = new Blob([jsonString], {type: "application/json", name: "moers-artists.json"});
                return blob;
            } else {
                return new Blob();
            }
        },

        artistsJsonObjectUrl() {
            return URL.createObjectURL(this.artistsJsonBlob);
        },

        flatData() {
            return this.artists.map(function(a) {
                let keys;
                try {
                    keys = Object.keys(a.links);
                } catch (e) {
                    console.log("Could not get keys for artist");
                    console.log(JSON.stringify(a));
                    keys = [];
                }
                return {
                    firstname: a.firstname,
                    surname: a.surname,
                    notes: a.notes,
                    concerts: a.concerts.map(c => `${c.concert}, [${c.starttime}], (${c.instruments})`).join(" | "),
                    instruments: Array.from(a.instruments).join(", "),
                    links: keys.map(lkey => a.links[lkey].map(l => l.url).join(", ")).join(", ")
                }
            })
        },

        ...mapGetters("gigdata", ["artists", "artistGigs", "artistLinks"]),
        ...mapState("gigdata", ["allMoersFestivalEvents"]),
    }
}
</script>