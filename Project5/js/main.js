var padding = {t: 40, r: 40, b: 40, l: 40};
var map = d3.select('#map');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var atlLatLng = new L.LatLng(27.809928, -39.902344);
var myMap = L.map('map').setView(atlLatLng, 2);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 10,
    minZoom: 1,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1IjoiamFnb2R3aW4iLCJhIjoiY2lnOGQxaDhiMDZzMXZkbHYzZmN4ZzdsYiJ9.Uwh_L37P-qUoeC-MBSDteA'
}).addTo(myMap);

console.log(myMap);

var mapSVGLayer = L.svg();
mapSVGLayer.addTo(myMap);
var mapSVG = d3.select('#map').select('svg');
var personaLinkG = mapSVG.select('g')
    .attr('class', 'leaflet-zoom-hide');

timelineSVG = d3.select(".timeline");
timelineWidth = timelineSVG.attr("width");
timelineHeight = timelineSVG.attr("height");
timelineSVG.attr("transform", "translate(" + [((window.innerWidth - timelineWidth)/2), ((window.innerHeight - timelineHeight)/2)] + ")");

globalCountryCenters = null;

d3.json('./data/ne_10m_admin_0_label_points-country.json', function(error, data) {

    var countryCenters = d3.nest().key(function(d) {
        return compress(d.properties.sr_subunit);
    }).rollup(function(v) {
        return v[0].geometry.coordinates;
    })
    .object(data.features);

    console.log(countryCenters);
    console.log(countryCenters['usa']);
    globalCountryCenters = countryCenters;
    drawPersonas(countryCenters);
});

function drawPersonas(countryCenters) {
    console.log("in drawPersonas");
    d3.csv('./data/nobel_laureates.csv', function(error, data) {
        if (error) throw error;      

        personaLinkG.selectAll('.grid-node')
            .data(data)
            .enter().append('circle')
            .attr('class', 'grid-node')
            .style('fill', 'blue')
            .style('fill-opacity', 0.6)
            .attr('r', 2);

        myMap.on('zoomend', updateLayers);
        updateLayers();
    });
}

function updateLayers() {
    personaLinkG.selectAll('.grid-node')
        .attr('cx', function(d){
            return myMap.latLngToLayerPoint([+d['born_country_lat'], +d['born_country_lng']]).x;
        })
        .attr('cy', function(d){
            return myMap.latLngToLayerPoint([+d['born_country_lat'], +d['born_country_lng']]).y;
        });
}

function compress(countryName) {
    return countryName.match(/\w/g).join("").toLowerCase();
}



/*d3.json("./data/world-countries.json", function(mapJsonError, world) {
    if (mapJsonError) throw mapJsonError;
    var countries = topojson.feature(world, world.objects.countries1).features,
      neighbors = topojson.neighbors(world.objects.countries1.geometries);
    var map = new Map(133, [(mapWidth / 2 - 11), (mapHeight/2 - 12)]);
    map.init(mapSVG, world, countries, neighbors);

    d3.csv('./data/nobel_laureates.csv', function(error, data) {
        if (error) throw error;

        var laureatesByBornCountry = d3.nest()
            .key(function(d) { return d.born_country; })
            .object(data);

        map.update();

        var timeslide = new Timeslide();
        timeslide.init(new Date("2010-06-26"), new Date("2017-06-26"), 600);


    });
});*/

