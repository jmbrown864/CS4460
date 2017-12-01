function Map(scale, translation) {
    this.scale = scale;
    this.translation = translation;
}

Map.prototype.init = function(g, world, countries, neighbors) {

    this.g = g;
    this.countries = countries;
    this.neighbors = neighbors;

    this.path = d3.geoPath()
        .projection(
            d3.geoMercator()
            .scale(this.scale)
            .translate(this.translation));

    var _this = this;

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .attr('x', function(d) { return _this.path.centroid(d)[0]; })
        .attr('y', function(d) { return _this.path.centroid(d)[1]; })
        .offset([0,0])
        .html(function(d) {
          return "<span class='details' style='text-align:center;'>" + d.properties.name +"</span>";
        });

    g.selectAll(".country")
        .data(countries)
        .enter().insert("path", ".graticule")
        .attr("class", "country")
        .attr("d", this.path)
        .style('fill', '#7d899b')
        .on('mouseover',function(d){
            tip.show(d);
        })
        .on('mouseout', function(d){
            tip.hide(d);
        });

    g.insert("path", ".graticule")
        .datum(topojson.mesh(world, world.objects.countries1, function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", this.path)
        .style('stroke', 'white')
        .style('fill', '#7d899b')
        .style('stroke-width', 1.3);

    g.call(tip);

}

Map.prototype.update = function() {

    var _this = this;

    var circleEnter = this.g.append("g")
        .attr("class", "bubble")
        .selectAll("circle")
        .data(this.countries).enter()
        .append("circle")
        .attr("transform", function(d) { return "translate(" + _this.path.centroid(d) + ")"; })
        .attr("r", 1.5);

    this.g.append("g")
        .attr("class", "country-label")
        .selectAll("text")
        .data(this.countries).enter()
        .append("text")
        .attr('x', function(d) { return _this.path.centroid(d)[0]; })
        .attr('y', function(d) { return _this.path.centroid(d)[1]; })
        .text(function(d) { return d.properties.name; });

}