var padding = {t: 40, r: 40, b: 40, l: 40};
mapSVG = d3.select(".map");
mapWidth = mapSVG.attr("width");
mapHeight = mapSVG.attr("height");
mapSVG.attr("transform", "translate(" + [((window.innerWidth - mapWidth)/2), ((window.innerHeight - mapHeight)/2)] + ")");

timelineSVG = d3.select(".timeline");
timelineWidth = timelineSVG.attr("width");
timelineHeight = timelineSVG.attr("height");
timelineSVG.attr("transform", "translate(" + [((window.innerWidth - timelineWidth)/2), ((window.innerHeight - timelineHeight)/2)] + ")");

d3.json("./data/world-countries.json", function(mapJsonError, world) {
    if (mapJsonError) throw mapJsonError;
    var countries = topojson.feature(world, world.objects.countries1).features,
      neighbors = topojson.neighbors(world.objects.countries1.geometries);
    var map = new Map(133, [(mapWidth / 2 - 11), (mapHeight/2 - 12)]);
    map.init(mapSVG, world, countries, neighbors);

    d3.csv('./data/nobel_laureates.csv', function(error, data) {
        if (error) throw error;

        map.update();


    });
});

