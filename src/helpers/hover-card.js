/**
 * A helper class for creating a hover card in d3.js to display three lines of information on mouseover
 * The width of the card is adjusted to match the longest text line
 * 
 * The three lines of text content are `cardTextTitle`, `cardTextContent1`, and `cardTextContent2`.
 * The `currentTarget` property is tracking the target of the most recent mouseover event. It should be set to null 
 * when handling a mouseout event.
 * 
 */
class HoverCard {

    constructor(svg) {
        this.card = svg
            .append("g")
            .attr("pointer-events", "none")
            .attr("display", "none");

        this.cardBackground = this.card
            .append("rect")
            .attr("width", 250)
            .attr("height", 65)
            .attr("fill", "#eee")
            .attr("stroke", "#333")
            .attr("rx", 4);

        this.cardTextTitle = this.card
            .append("text")
            .attr("font-size", 14)
            .attr("transform", "translate(8, 20)")
            .text("DEFAULT NAME");

        this.cardTextContent1 = this.card
            .append("text")
            .attr("font-size", 12)
            .attr("transform", "translate(8, 35)")
            .text("DEFAULT TEXT");
        
        this.cardTextContent2 = this.card
            .append("text")
            .attr("font-size", 12)
            .attr("transform", "translate(8, 50)")
            .text("DEFAULT TEXT");

        this.currentTarget = null;
    }
}

export {

    HoverCard

}