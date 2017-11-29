function Map(scale, translation) {
    this.scale = scale;
    this.translation = translation;
}

Map.prototype.init = function(g, world, tip) {
    var countries = topojson.feature(world, world.objects.countries1).features,
      neighbors = topojson.neighbors(world.objects.countries1.geometries);

    path = d3.geoPath()
        .projection(
            d3.geoMercator()
            .scale(this.scale)
            .translate(this.translation));

    g.selectAll(".country")
    .data(countries)
    .enter().insert("path", ".graticule")
    .attr("class", "country")
    .attr("d", path)
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
        .attr("d", path)
        .style('stroke', 'white')
        .style('fill', '#7d899b')
        .style('stroke-width', 1.3);

}

Map.prototype.update = function(g, dataset) {

}