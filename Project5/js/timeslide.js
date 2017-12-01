function Timeslide(startDate, endDate, width) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.width = width;
}

Timeslide.prototype.init = function(g, x, y) {
    var timeScale = d3.scaleTime()
        .domain([this.startDate, this.endDate])
        .range([0, this.width])
        .clamp(true);

    var rangeWidget = d3.elts.startEndSlider().minRange(365*24*3600*1000);

}

Timeslide.prototype.update = function(g, x, y) {

}
