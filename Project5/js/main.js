svg = d3.select("svg");
width = svg.attr("width");
height = svg.attr("height");
path = d3.geoPath()
        .projection(
            d3.geoMercator()
            .scale(160)
            .translate( [(width / 2), (height/2)] ));

var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function(d) {
              return "<span class='details'>" + d.properties.name +"</span>";
            });

svg.call(tip);

d3.json("./data/world-countries.json", function(mapJsonError, world) {
    if (mapJsonError) throw mapJsonError;
    var countries = topojson.feature(world, world.objects.countries1).features,
      neighbors = topojson.neighbors(world.objects.countries1.geometries);

  svg.selectAll(".country")
    .data(countries)
    .enter().insert("path", ".graticule")
    .attr("class", "country")
    .attr("d", path)
    .on('mouseover',function(d){
        tip.show(d);
    })
    .on('mouseout', function(d){
        tip.hide(d);
    });

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries1, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path)
      .style("stroke", "#fff");

    d3.csv('./data/nobel_laureates.csv', function(error, data) {
        if (error) throw error;


    });
});

