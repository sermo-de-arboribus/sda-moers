<template>
    <div class="container network-wrapper">
        <h2> Netzwerk </h2>
        <network ref="network"
            :edges="edges"
            :nodes="nodes">
        </network>
    </div>
</template>

<style scoped>
.network-wrapper {
    border: 1px solid black;
    height: 1000px;
    min-height: 100vh;
    padding: 10px;
    width: 1250px;
}
</style>


<script>
import { mapState } from "vuex";
import { Network } from "vue-vis-network";

export default {
    name: "ArtistNetwork",
    components: {
        Network
    },
    computed: {
        nodes() {
            return this.allMoersFestivalEvents.map(e => { return { id: e.id, label: e.name }});
        },
        
        ...mapState("gigdata", ["allMoersFestivalEvents"])
    },
    data() {
        return {
            edges: [
                {from: 1, to: 2}
            ]
        }
    }
}
</script>