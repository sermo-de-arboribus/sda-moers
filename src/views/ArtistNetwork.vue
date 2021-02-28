<template>
    <div class="network-root">
        <h1>{{$t("artistsNetwork.header")}}</h1>
        <p>{{$t("artistsNetwork.intro")}}</p>
        <svg :height="canvasHeight" :width="canvasWidth">
        </svg>
    </div>
</template>

<style>
.links line {
    stroke: #999;
    stroke-opacity: 0.6; 
}

.nodes .node circle {
    stroke: #fff;
    stroke-width: 1.5px;
}
</style>

<script>
import d3 from "../lib/d3-imports";
import { mapGetters, mapState } from "vuex";

const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1200;
const NETWORK_MAX_DEGREE = 2;
const NODE_RADIUS = 20;
const STROKE_WIDTH = 2;

export default {
    name: "ArtistNetwork",
    computed: {
        artistNodes() {
            const aggregator = { nodes: new Map(), links: [] };
            expandArtistNodesAggregationRecursively(this.artists, this.allMoersFestivalEvents, 0, NETWORK_MAX_DEGREE, aggregator, this.centeredArtist);

            return { nodes: Array.from(aggregator.nodes.values()), links: aggregator.links };
        },

        centeredArtist() {
            if(this.$route && this.$route.query && this.$route.query.firstname && this.$route.query.surname) {
                return {
                    firstname: this.$route.query.firstname,
                    surname: this.$route.query.surname
                }
            } else {
                return this.defaultArtist;
            }
        },

        ...mapGetters("gigdata", ["artists"]),
        ...mapState("gigdata", ["allMoersFestivalEvents"]),
    },
    data() {
        return {
            canvasHeight: CANVAS_HEIGHT,
            canvasWidth: CANVAS_WIDTH,
            defaultArtist: {
                firstname: "Amy",
                surname: "Denio"
            }
        }
    },
    mounted() {
        // select the svg element from the template
        const svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        // create the link force
        const links = this.artistNodes.links.map(l => Object.create(l));
        const nodes = this.artistNodes.nodes.map(n => Object.create(n));

        const linkForce = d3.forceLink(links)
            .id(d => d.artistId)
            .distance(60);

        // create a force simulation for the nodes
        const forceManyBody = d3.forceManyBody();
        forceManyBody.strength(-70);

        const forceCollide = d3.forceCollide();
        forceCollide.radius(NODE_RADIUS)
            .strength(1.1);

        const simulation = d3.forceSimulation(nodes)
            .force("links", linkForce)
            .force("collision", forceCollide)
            .force("charge", forceManyBody)
            .force("center", d3.forceCenter(width / 2, height / 2));

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
            .append("g")
            .attr("class", "node");

        node.append("circle")
            .attr("r", NODE_RADIUS)
            .attr("fill", "#42b983");

        node.append("title")
            .text(d => d.firstname + " " + d.surname);

        node.append("text")
            .text(d => [...d.firstname.split(" ").map(s => s.substring(0,1)), d.surname.substring(0,1)].join(""))
            .attr("dx", -12)
            .attr("dy", 2)
            .attr("fill", "white");

        const tickActions = function () {
            // update link positions
            link.attr("x1", function(d) { return d.source.x })
                .attr("y1", function(d) { return d.source.y })
                .attr("x2", function(d) { return d.target.x })
                .attr("y2", function(d) { return d.target.y });

            // update circle positions to reflect node updates on each tick of the simulation 
            node.attr("transform", d => {
                const newX = Math.max(NODE_RADIUS, Math.min(CANVAS_WIDTH - NODE_RADIUS, d.x));
                const newY = Math.max(NODE_RADIUS, Math.min(CANVAS_HEIGHT - NODE_RADIUS, d.y));
                return `translate(${newX}, ${newY})`
            });
        }

        simulation.on("tick", tickActions);

        svg.node();
    }
}

function expandArtistNodesAggregationRecursively(artists, events, currentDegree, maxDegree, aggregator, artist) {
    const artistId = artist.firstname + artist.surname;
    const currentNode = artists.find(a => a.firstname == artist.firstname && a.surname == artist.surname);
    const eventIds = currentNode ? currentNode.concerts.map(c => c.id) : [];
    aggregator.nodes.set(artistId, Object.assign(artist, { artistId }));

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
                }
            });
        });
    }

}
</script>