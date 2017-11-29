var padding = {t: 40, r: 40, b: 40, l: 40};
mapSVG = d3.select(".map");
mapWidth = mapSVG.attr("width");
mapHeight = mapSVG.attr("height");
mapSVG.attr("transform", "translate(" + [((window.innerWidth - mapWidth)/2), ((window.innerHeight - mapHeight)/2)] + ")");

timelineSVG = d3.select(".timeline");
timelineWidth = timelineSVG.attr("width");
timelineHeight = timelineSVG.attr("height");
timelineSVG.attr("transform", "translate(" + [((window.innerWidth - timelineWidth)/2), ((window.innerHeight - timelineHeight)/2)] + ")");

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
      return "<span class='details'>" + d.properties.name +"</span>";
    });

mapSVG.call(tip);

d3.json("./data/world-countries.json", function(mapJsonError, world) {
    if (mapJsonError) throw mapJsonError;
    var map = new Map(102, [(mapWidth / 2 - 12), (mapHeight/2)]);
    map.init(mapSVG, world, tip);

    d3.csv('./data/nobel_laureates.csv', function(error, data) {
        if (error) throw error;


    });
});

