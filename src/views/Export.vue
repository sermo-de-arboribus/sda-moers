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
                <div class="col">
                    <a :href="artistsXmlBlobUrl">
                        <button type="button" class="btn btn-primary">XML</button>
                    </a>
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

        artistsXmlString() {
            let xmlParts = this.artists.map(a => {

                const notes = a.notes ? `${Object.keys(a.notes).map(loc => `<note xml:lang="loc">${encodeXmlString(a.notes[loc])}</note>`).join("")}` : "";
                const links = a.links ? `${Object.keys(a.links).map(site => {
                                return `<${site}>
                                    ${a.links[site].map(l => `<link type="${l.type}">${encodeXmlString(l.url)}</link>`).join("")}
                                </${site}>`
                            }).join("")}` : "";

                try {
                    return `<artist>
                        <firstname>${encodeXmlString(a.firstname)}</firstname>
                        <surname>${encodeXmlString(a.surname)}</surname>
                        <notes>${notes}</notes>
                        <instruments>${a.instruments.map(i => `<instrument>${encodeXmlString(i)}</instrument>`).join("")}</instruments>
                        <concerts>${a.concerts.map(c => `<concert><title>${encodeXmlString(c.concert)}</title><year>${c.year}</year><instruments>${encodeXmlString(c.instruments)}</instruments><starttime>${c.starttime}</starttime></concert>`).join("")}</concerts>
                        <links>${links}</links>
                    </artist>`
                } catch (err) {
                    console.error("Error when parsing artist", a);
                    console.error(err);
                    return "";
                }
            });

            return `<artists xmlns="https://sermo-de-arboribus.de/moers-festival">${xmlParts.join("\n")}</artists>`;
        },

        artistsXmlBlob() {            
            return new Blob([this.artistsXmlString], {type: "text/xml", name: "moers-artists.xml"});
        },

        artistsXmlBlobUrl() {
            return URL.createObjectURL(this.artistsXmlBlob);
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
                    instruments: a.instruments.join(", "),
                    links: keys.map(lkey => a.links[lkey].map(l => l.url).join(", ")).join(", ")
                }
            })
        },

        ...mapGetters("gigdata", ["artists", "artistGigs", "artistLinks"]),
        ...mapState("gigdata", ["allMoersFestivalEvents"]),
    }
}

function encodeXmlString(sourceString) {
    if(sourceString) {
        if(!sourceString.replace) {
            console.log(sourceString);
        }
        return sourceString.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');        
    } else {
        return "";
    }
    
}
</script>