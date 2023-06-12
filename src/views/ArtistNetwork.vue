<template>
    <div class="container-fluid">
        <h1>{{$t("artistsNetwork.header")}}</h1>
        <p>{{$t("artistsNetwork.intro")}}</p>
        <div class="row">
            <div class="col-9">
                <div class="arrow arrow-up" @mousedown="startMovingViewBox(0, -10)" @mouseleave="stopMovingViewBox" @mouseup="stopMovingViewBox" @touchstart="startMovingViewBox(0, 10)" @touchend="stopMovingViewBox" @touchcancel="stopMovingViewBox"><ArrowUp/></div>
                <div class="arrow arrow-down" @mousedown="startMovingViewBox(0, 10)" @mouseleave="stopMovingViewBox" @mouseup="stopMovingViewBox" @touchstart="startMovingViewBox(0, 10)" @touchend="stopMovingViewBox" @touchcancel="stopMovingViewBox"><ArrowDown/></div>
                <div class="arrow arrow-left" @mousedown="startMovingViewBox(-10, 0)" @mouseleave="stopMovingViewBox" @mouseup="stopMovingViewBox" @touchstart="startMovingViewBox(0, 10)" @touchend="stopMovingViewBox" @touchcancel="stopMovingViewBox"><ArrowLeft/></div>
                <div class="arrow arrow-right" @mousedown="startMovingViewBox(10, 0)" @mouseleave="stopMovingViewBox" @mouseup="stopMovingViewBox" @touchstart="startMovingViewBox(0, 10)" @touchend="stopMovingViewBox" @touchcancel="stopMovingViewBox"><ArrowRight/></div>
                <svg id="networkRoot" ref="networkRoot"></svg>
            </div>
            <div class="col-3 sideInfo">
                <h2>{{$t("artistsNetwork.selectedArtist")}}</h2>
                <h3>{{ centeredArtist.firstname }} {{ centeredArtist.surname }}</h3>
                <p>{{$t("artistsTable.instruments")}}: {{ centeredArtist.instruments.map(i => this.$t(`instruments.${i}`)).join(", ") }}</p>
                <h4>{{$t("artistsTable.concerts")}}</h4>
                <ul>
                    <li v-for="cd in centeredArtist.concerts" :key="cd.id">
                        {{ cd.concert }} ({{ cd.instruments }}): {{ cd.year }}
                    </li>
                </ul>
                <h4 v-if="centeredArtist.links.length">{{$t("artistsTable.links")}}</h4>
                <div style="padding:10px" class="artistlinks" cols="1" cols-sm="2" cols-lg="3">
                    <template v-for="links in centeredArtist.links">
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
.arrow {
    position: absolute;
    width: 35px;
}

.arrow-left {
    right: 70px;
    top: 30px;
}

.arrow-right {
    right: 10px;
    top: 30px;
}

.arrow-up, .arrow-down {
    right: 40px;
}

.arrow-down {
    top: 60px;
}

.arrow-up {
    top: 0;
}

.links line {
    stroke: #999;
    stroke-opacity: 0.6; 
}

#networkRoot {
    height: 80vh;
    width: 100%;
}

#networkRoot svg {
    overflow: auto;
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

svg text {
    user-select: none;
    pointer-events: none;
}

circle.artist {
    cursor: pointer;
}

</style>

<script>
import d3 from "../lib/d3-imports";
import { HoverCard } from "../helpers/hover-card";
import { mapGetters, mapState } from "vuex";

// SVG icons
import ArrowUp from "../components/svg/ArrowUpIcon.vue";
import ArrowDown from "../components/svg/ArrowDownIcon.vue";
import ArrowLeft from "../components/svg/ArrowLeftIcon.vue";
import ArrowRight from "../components/svg/ArrowRightIcon.vue";

const NETWORK_MAX_DEGREE = 2;

export default {
    name: "ArtistNetwork",
    components: {
        ArrowUp, ArrowDown, ArrowLeft, ArrowRight
    },
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
                nodesArray[0].type = "center";
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
                id: "AmyDenio",
                surname: "Denio",
                concerts: [
                    {
                        "concert": "Hans Reichel \"Hit & Miss\" (DE/KOR/USA/SWE/CH/NOR/JPN)",
                        "description": "Besetzung: Hans Reichel (g), Jin hi Kim (komungo), J.A. Deane (tb, electr), Shelley Hirsch (voc), David Weinstein (synth, electr), Amy Denio (eb), Shōji Hano (dr), Erik Balke (reeds), Jonas Åkerblom (reeds), Wädi Gysi (g), Eugene Chadbourne (g)",
                        "instruments": "eb",
                        "id": "d4e1281",
                        "starttime": "1990-06-03 00:00:00",
                        "year": "1990"
                    }
                ],
                instruments: ["eb"],
                links: {
                    "allaboutjazz": [{"type": "search", "url": "https://www.allaboutjazz.com/tag-amy-denio__30514","logoUrl": "/aaj-logo.jpg"}],
                    "allmusic": [{"type": "personal", "url": "https://www.allmusic.com/artist/amy-denio-mn0000766780"}],
                    "bandcamp": [{"type": "personal", "url": "https://amydenio.bandcamp.com/"}, {"type": "album", "url": "https://aphoniarecordings.bandcamp.com/album/sub-rosa"}, {"type": "album", "url": "https://bhhstuff.bandcamp.com/album/bret-hart-amy-denio-improvised-duets-2001-digital"}],
                    "discogs": [{"type": "personal", "url": "https://www.discogs.com/artist/270152-Amy-Denio"}],
                    "homepage": [{"type": "personal", "url": "http://www.amydenio.com/"}, {"type": "personal", "url": "https://amydenio.me/"}],
                    "radiohoerer": [{"type": "search", "url": "https://radio.friendsofalan.de/?s=%22Amy%20Denio%22&category_name=nach-hoeren"}],
                    "soundcloud": [{"type": "personal", "url": "https://soundcloud.com/amy-denio"}],
                    "twitter": [{"type": "personal", "url": "https://twitter.com/AmyDenio"}],
                    "wikipedia": [{"type": "personal", "locales": [{"locale": "de", "url": "https://de.wikipedia.org/wiki/Amy_Denio"}, {"locale": "en", "url": "https://en.wikipedia.org/wiki/Amy_Denio"}]}],
                    "youtube": [{"type": "personal", "url": "https://www.youtube.com/user/deniaural"}, {"type": "agency", "url": "https://www.youtube.com/channel/UCWvua5eiLSf9OpTk7Hu5H5w"}]
                }
            },
            movingViewBox: false,
            viewBox: {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            }
        }
    },
    methods: {

        serializeViewBox() {
            const { viewBox } = this;
            return `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
        },

        startMovingViewBox(dx, dy) {
            if(!this.movingViewBox) {
                this.movingViewBox = setInterval(() => this.moveViewBox(dx, dy), 300);
            }
        },

        stopMovingViewBox() {
            clearInterval(this.movingViewBox);
            this.movingViewBox = false;
        },

        moveViewBox(dx, dy) {

            this.viewBox.x += dx;
            this.viewBox.y += dy;

            const networkRoot = document.getElementById("networkRoot");
            networkRoot.setAttribute("viewBox", this.serializeViewBox());
        },
        renderGraph() {
            // select the svg element from the template
            const networkRoot = d3.select("#networkRoot");

            this.viewBox.height = pixelsToNumber(networkRoot.style("height"));
            this.viewBox.width = pixelsToNumber(networkRoot.style("width"));

            networkRoot.select("#networkRoot").remove();

            // get svg root element
            const svg = networkRoot.append("svg")
                .attr("id", "networkRoot")
                .attr("viewBox", this.serializeViewBox())
                .attr("preserveAspectRatio", "xMidYMid meet");
            
            const instanceDomain = [Number.MAX_VALUE, 1];
            this.artistNodes.nodes.forEach( n => {
                instanceDomain[0] = Math.max(1, Math.min(instanceDomain[0], n.linkCount));
                instanceDomain[1] = Math.max(instanceDomain[1], n.linkCount);
            })

            // define scales (for node circle radius, node colour, and font size of labels)
            const nodeScale = d3.scaleLinear()
                .domain([0, determineNumberOfLinks(this.artistNodes) ])
                .range([12, 30]);

            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            
            const fontSizeScale = d3.scaleLinear()
                .domain([0, determineNumberOfLinks(this.artistNodes) ])
                .range([7, 12]);

            // define force layout simulation
            const simulation = createSimulation(this.artistNodes);

            // create links / edges
            const link = createLinks(svg, this.artistNodes);
            // create nodes
            const node = createNodeCircles(svg, this.$router, this.artistNodes, nodeScale, colorScale);
            node.call(drag(simulation));
            // create text (for node labels)
            const textContainer = createTextContainer(svg, this.artistNodes, fontSizeScale);        
            // create hover card (for mouseover text)
            const hoverCard = new HoverCard(svg);
            const translator = this.$i18n;
            initMouseEvents(node, hoverCard, simulation, translator);
            // define d3 force layout's updating behaviour (on every tick)
            simulation.on("tick", () => tickFunction(textContainer, nodeScale, node, link, hoverCard));
        }
    },
    beforeRouteUpdate(to, from, next) {
        // "unfix" the centered artist's node
        delete this.artistNodes.nodes[0].fx;
        delete this.artistNodes.nodes[0].fy;
        next();
    },

    created() {
        this.defaultArtist = this.artists.find((a) => a.firstname === "Amy" && a.surname == "Denio");
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

function createLinks(svg, data) {
    return svg
        .selectAll("path.link")
        .data(data.links)
        .enter()
        .append("path")
        .attr("stroke", "#999")
        .attr("fill", "none");
}

function createNodeCircles(svg, router, data, nodeScale, colorScale) {

    const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", (d) => nodeScale(d.linkCount))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5)
        .style("fill", (d) => colorScale(d.type))
        .attr("class", (d) => d.type)
        .on("click", (event, data) => {
            if(data.type === "artist") {
                router.push( { path: "/network", query: { firstname: data.firstname, surname: data.surname }});
            }
        });

    return node;
}

function createSimulation(data) {
    return d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody().strength(-60))
        .force("link", d3.forceLink(data.links)
            .id(d => d.id)
            .distance(20))
        .force("center", d3.forceCenter(600, 400))
        .force("collide", d3.forceCollide()
            .radius(d => d.r * 2.5)
            .strength(1.3)
            .iterations(3));
}

function createTextContainer(svg, data, fontSizeScale) {
    return svg
        .selectAll("g.label")
        .data(data.nodes)
        .enter()
        .append("g")
        .append("text")
        .text((d) => {
            switch(d.type) {
                case "artist":
                case "center":
                    return [...d.firstname.split(" ").map(s => s.substring(0,1)), d.surname.substring(0,1)].join("");
                case "concert": 
                    return d.start_date.substring(0,4);
                default:
                    return "";
            }
        })
        .attr("font-size", (d) => fontSizeScale(d.linkCount));
}

function determineNumberOfLinks(data) {

    return d3.max(data.nodes.map(n => n.linkCount));
}

function drag(simulation) {

    const dragStarted = (event, d) => {
        if(!event.active) {
            simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;
    }

    const dragged = (event, d) => {

        d.fx = event.x;
        d.fy = event.y;

    }

    const dragEnded = (event, d) => {
        if(!event.active) {
            simulation.alphaTarget(0);
        }

        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded);
}

function expandArtistNodesAggregationRecursively(artists, events, currentDegree, maxDegree, aggregator, artist) {
    const artistId = artist.firstname + artist.surname;
    const currentNode = artists.find(a => a.firstname == artist.firstname && a.surname == artist.surname);
    const eventIds = currentNode ? currentNode.concerts.map(c => c.id) : [];
    aggregator.nodes.set(artistId, Object.assign(artist, { id: artistId, linkCount: eventIds.length, type: "artist" }));

    if(currentDegree <= maxDegree && eventIds.length) {
        
        // iterate through events
        eventIds.forEach( eId => {

            const event = events.find(e => e.id === eId);

            // add concert node, if it hasn't been processed yet
            if(!aggregator.nodes.has(eId)) {

                aggregator.nodes.set(eId, Object.assign(event, { linkCount: event.artists.length, type: "concert" }));

                const nextArtists = events.find(e => e.id === eId).artists;

                // iterate through current event's artists
                nextArtists.forEach( a => {
                    const targetArtistId = a.firstname + a.surname;
                    const linkExists = aggregator.links.some( l => l.source === eId && l.target === targetArtistId );
                    
                    if(!linkExists) {
                        aggregator.links.push({ source: eId, target: targetArtistId });
                        expandArtistNodesAggregationRecursively(artists, events, currentDegree + 1, maxDegree, aggregator, a);
                    }
                });
            }
        });
    }
}

function initMouseEvents(node, hoverCard, simulation, translate) {

    node.on("mouseover", (event, d) => {

        hoverCard.card.attr("display", "block");

        hoverCard.currentTarget = event.target;
        const cardTextTitleString = d.type === "concert" ? translate.t("general.concert") : translate.t("general.artist");
        const cardTextContent1String = d.type === "concert" ? d.name : d.firstname + " " + d.surname;
        const cardTextContent2String = d.type === "concert" ? d.start_date : d.instruments;

        hoverCard.cardTextTitle.text(cardTextTitleString);
        hoverCard.cardTextContent1.text(cardTextContent1String);
        hoverCard.cardTextContent2.text(cardTextContent2String);

        const cardTitleWidth = hoverCard.cardTextTitle.node().getBBox().width;
        const cardTextContent1Width = hoverCard.cardTextContent1.node().getBBox().width;
        const cardTextContent2Width = hoverCard.cardTextContent2.node().getBBox().width;
        const cardWidth = Math.max(cardTitleWidth, cardTextContent1Width, cardTextContent2Width);

        hoverCard.cardBackground.attr("width", cardWidth + 16);

        simulation.alphaTarget(0).restart();
    });

    node.on("mouseout", () => {
        hoverCard.currentTarget = null;
        hoverCard.card.attr("display", "none");
    });
}

const lineGenerator = d3.line();

function pixelsToNumber(pixels = "0") {
    return parseInt(pixels.replace(/px$/, ""), 10);
}

function tickFunction(textContainer, nodeScale, node, link, hoverCard) {

    textContainer
        .attr("transform", (d) => {
            // const numberOfLinks = d.type === "concert" ? nodeScale(d.numberOfArtists) : nodeScale(d.numberOfConcerts);
            const scale = nodeScale(d.linkCount);
            return `translate(${d.x - scale / 2}, ${d.y})`;
        });

    node.attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

    link.attr("d", (d) => {
        return lineGenerator([
            [d.source.x, d.source.y],
            [d.target.x, d.target.y]
        ]);
    });

    if (hoverCard.currentTarget) {

        const radius = hoverCard.currentTarget.r.baseVal.value;
        const xPos = hoverCard.currentTarget.cx.baseVal.value + radius + 3;
        const yPos = hoverCard.currentTarget.cy.baseVal.value + radius + 3;

        hoverCard.card.attr("transform", `translate(${xPos}, ${yPos})`);
    }
}
</script>