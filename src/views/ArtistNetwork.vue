<template>
    <div class="container-fluid">
        <h1>{{$t("artistsNetwork.header")}}</h1>
        <p>{{$t("artistsNetwork.intro")}}</p>
        <div class="row">
            <div class="col-9">
                <div id="networkRoot" ref="networkRoot">
                </div>
            </div>
            <div class="col-3 sideInfo">
                <h2>{{$t("artistsNetwork.selectedArtist")}}</h2>
                <h3>{{ centeredArtist.firstname }} {{ centeredArtist.surname }}</h3>
                <p>{{$t("artistsTable.instruments")}}: {{ centeredArtist.instruments.join(", ") }}</p>
                <h4>{{$t("artistsTable.concerts")}}</h4>
                <ul>
                    <li v-for="cd in centeredArtist.concerts" :key="cd.id">
                        {{ cd.concert }} ({{ cd.instruments }}): {{ cd.year }}
                    </li>
                </ul>
                <h4 v-if="centeredArtist.links.length">{{$t("artistsTable.links")}}</h4>
                <div style="padding:10px" class="artistlinks" cols="1" cols-sm="2" cols-lg="3">
                    <template class="col" v-for="links in centeredArtist.links">
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
            </div>
        </div>
    </div>
</template>

<style>
.links line {
    stroke: #999;
    stroke-opacity: 0.6; 
}

#networkRoot {
    height: 80vh;
    width: 100%;
}

.nodes circle {
    cursor: pointer;
    stroke: #fff;
    stroke-width: 1.5px;
}

.nodeTexts {
    cursor: pointer;
}

.sideInfo {
    border: 1px solid black;
    padding: 2em;
}

.sideInfo h2, .sideInfo h3 {
    color: #42b983;
}

</style>

<script>
import d3 from "../lib/d3-imports";
import { mapGetters, mapState } from "vuex";

const NETWORK_MAX_DEGREE = 2;
// const NODE_RADIUS = 20;
const STROKE_WIDTH = 2;

export default {
    name: "ArtistNetwork",
    computed: {
        artistNodes() {
            const aggregator = { nodes: new Map(), links: [] };
            expandArtistNodesAggregationRecursively(this.artists, this.allMoersFestivalEvents, 0, NETWORK_MAX_DEGREE, aggregator, this.centeredArtist);
            const nodesArray = Array.from(aggregator.nodes.values());
            if(nodesArray.length && this.$refs.networkRoot) {
                // set first node to fixed position
                const height = this.$refs.networkRoot.clientHeight;
                const width = this.$refs.networkRoot.clientWidth;
                const fx = width / 2;
                const fy = height / 2;
                nodesArray[0].fx = fx;
                nodesArray[0].fy = fy;
            }
            return { nodes: nodesArray, links: aggregator.links };
        },

        centeredArtist() {
            if(this.$route && this.$route.query && this.$route.query.firstname && this.$route.query.surname) {
                const artist = this.artists.find(a => a.firstname === this.$route.query.firstname && a.surname === this.$route.query.surname);
                if(artist && artist.concerts.length) {
                    artist.concerts.sort((a, b) => a.year - b.year);
                }
                return artist;
            } else {
                return this.defaultArtist;
            }
        },

        ...mapGetters("gigdata", ["artists"]),
        ...mapState("gigdata", ["allMoersFestivalEvents"]),
    },
    data() {
        return {
            defaultArtist: {
                firstname: "Amy",
                surname: "Denio",
                concerts: [
                    {
                        "name": "Hans Reichel \"Hit & Miss\" (DE/KOR/USA/SWE/CH/NOR/JPN)",
                        "description": "Besetzung: Hans Reichel (g), Jin hi Kim (komungo), J.A. Deane (tb, electr), Shelley Hirsch (voc), David Weinstein (synth, electr), Amy Denio (eb), Shōji Hano (dr), Erik Balke (reeds), Jonas Åkerblom (reeds), Wädi Gysi (g), Eugene Chadbourne (g)",
                        "id": "d4e1281",
                        "start_date": "1990-06-03 00:00:00"
                    }
                ]
            }
        }
    },
    methods: {

        renderGraph() {
            // select the svg element from the template
            const networkRoot = d3.select("#networkRoot");

            const height = pixelsToNumber(networkRoot.style("height"));
            const width = pixelsToNumber(networkRoot.style("width"));

            networkRoot.select("svg").remove();

            const svg = networkRoot.append("svg")
                .attr("viewBox", [0, 0, width, height].join(" "))
                .attr("preserveAspectRatio", "xMidYMid meet");
            
            const instanceDomain = [Number.MAX_VALUE, 1];
            this.artistNodes.nodes.forEach( n => {
                instanceDomain[0] = Math.max(1, Math.min(instanceDomain[0], n.linkCount));
                instanceDomain[1] = Math.max(instanceDomain[1], n.linkCount);
            })

            const radiusScale = d3.scaleLog()
                .domain(instanceDomain)
                .range([10, 32])
                .clamp(true);
            
            const sizeScale = d3.scaleLog()
                .domain(instanceDomain)
                .rangeRound([7, 6, 5, 4, 3, 2, 1])
                .clamp(true);
            
            // create the link force
            const links = this.artistNodes.links.map(l => Object.create(l));
            const nodes = this.artistNodes.nodes.map(n => Object.assign(n, {r: radiusScale(n.linkCount), size: sizeScale(n.linkCount)}));

            const linkForce = d3.forceLink(links)
                .id(d => d.artistId)
                .distance(80);

            // create a force simulation for the nodes
            const forceManyBody = d3.forceManyBody().strength(-130);

            const forceCollide = d3.forceCollide()
                .radius(d => d.radius * 2)
                .strength(1);

            const simulation = d3.forceSimulation(nodes)
                //.force("center", d3.forceCenter(width / 2, height / 2))
                .force("charge", forceManyBody)
                .force("link", linkForce)
                .force("collide", forceCollide)

            // draw the lines for the links
            const link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .attr("stroke-width", STROKE_WIDTH);

            link.append("title")
                .text(d => d.eventId);

            // draw circles for the nodes
            const node = svg.append("g")
                .attr("class", "nodes")
                .selectAll(".node")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", (node) => {
                    let r = node.r
                    if(node.artistId === this.centeredArtist.artistId) {
                        r = 2 * r
                    }
                    return r.toString()
                })
                .attr("fill", (node) => {
                    let color = "#42b983"
                    if(node.artistId === this.centeredArtist.artistId) {
                        color = "#50bcfa"
                    }
                    return color
                })
                .on("click", (event, data) => {
                    this.$router.push( { path: "/network", query: { firstname: data.firstname, surname: data.surname }});
                })

            node.append("title")
                .text(d => d.firstname + " " + d.surname);

            const nodeTexts = svg.append("g")
                .attr("class", "nodeTexts")
                .selectAll(".nodeText")
                .data(nodes)
                .enter()
                .append("text")
                .text(d => [...d.firstname.split(" ").map(s => s.substring(0,1)), d.surname.substring(0,1)].join(""))
                .on("click", (event, data) => {
                    this.$router.push( { path: "/network", query: { firstname: data.firstname, surname: data.surname }});
                });

            nodeTexts.append("title")
                .text(d => d.firstname + " " + d.surname);

            const tickActions = function () {
                // update link positions
                link.attr("x1", function(d) { return d.source.x })
                    .attr("y1", function(d) { return d.source.y })
                    .attr("x2", function(d) { return d.target.x })
                    .attr("y2", function(d) { return d.target.y });

                node.attr("cx", (d) => d.x ) // Math.max(d.r, (Math.min(width - d.r - 100, d.x))))
                    .attr("cy", (d) => d.y ) //Math.max(d.r, (Math.min(height - d.r - 5, d.y))));

                nodeTexts.attr("x", ({ x, r }) => x - r/2)
                    .attr("y", ({ y, r }) => y + r/2);
            }

            simulation.on("tick", tickActions);


            // svg.call(this.drag(simulation, svg));

            svg.node();
        }
    },
    beforeRouteUpdate(to, from, next) {
        // "unfix" the centered artist's node
        delete this.artistNodes.nodes[0].fx;
        delete this.artistNodes.nodes[0].fy;
        next();
    },

    mounted() {
        if(this.centeredArtist) {
            this.renderGraph();
        }
    },
    watch: {
        centeredArtist: {
            deep: true,

            handler(newVal) { 
                if(newVal) {
                    this.renderGraph();
                }
            }
        }
    }
}

function expandArtistNodesAggregationRecursively(artists, events, currentDegree, maxDegree, aggregator, artist) {
    const artistId = artist.firstname + artist.surname;
    const currentNode = artists.find(a => a.firstname == artist.firstname && a.surname == artist.surname);
    const eventIds = currentNode ? currentNode.concerts.map(c => c.id) : [];
    aggregator.nodes.set(artistId, Object.assign(artist, { artistId, linkCount: eventIds.length }));

    if(currentDegree <= maxDegree && eventIds.length) {
        
        // iterate through events
        eventIds.forEach( eId => {

            const nextArtists = events.find(e => e.id === eId).artists;

            // iterate through current event's artists
            nextArtists.forEach( a => {
                const targetArtistId = a.firstname + a.surname;
                const linkExists = aggregator.links.some( l => {
                    return l.eventId === eId && 
                        (( l.target === targetArtistId && l.source === artistId ) ||
                        ( l.source === targetArtistId && l.target === artistId ))
                })
                if( artistId !== targetArtistId && !linkExists) {
                    aggregator.links.push({ source: artistId, target: targetArtistId, eventId: eId });
                    expandArtistNodesAggregationRecursively(artists, events, currentDegree + 1, maxDegree, aggregator, a);
                } else {
                    // artist already exists, just add linkCount
                    const artist = aggregator.nodes.get(targetArtistId);
                    artist.linkCount ++;
                }
            });
        });
    }
}

function pixelsToNumber(pixels = "0") {
    return parseInt(pixels.replace(/px$/, ""), 10);
}
</script>