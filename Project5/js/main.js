var padding = {t: 40, r: 40, b: 40, l: 40};
var treemapSVG = d3.select('#treemap');
var treemapWidth = +treemapSVG.attr('width');
var treemapHeight = +treemapSVG.attr('height');
treemapSVG.attr("transform", "translate(" + [((window.innerWidth - treemapWidth)/2), ((window.innerHeight - treemapHeight)/2)] + ")");

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([treemapWidth, treemapHeight])
    .round(true)
    .paddingInner(1);

timelineSVG = d3.select(".timeline");
timelineWidth = timelineSVG.attr("width");
timelineHeight = timelineSVG.attr("height");
timelineSVG.attr("transform", "translate(" + [((window.innerWidth - timelineWidth)/2), ((window.innerHeight - timelineHeight)/2)] + ")");

d3.csv('./data/nobel_laureates.csv', function(error, data) {
    if (error) throw error; 

    var nlByAffiliation = d3.nest().key(function(d) {
        return d.category;
    }).key(function(e) {
        return e.affiliation;
    }).rollup(function(v) {
        return v.length;
    }).entries(data)
    .sort(function(a, b) {
        return d3.sum(b.values, function(c) { return c.value; }) - d3.sum(a.values, function(c) { return c.value; });
    });
    nlByAffiliation.forEach((category) => {
        category.values.sort(function(a, b) {
            return b.value - a.value;
        });
    });

    nlByAffiliation = {"key": "Nobel Laureates", "values": nlByAffiliation}; 
    var nlByAffiliation = { "name": "Nobel Laureates", "children":
        nlByAffiliation.values.map( function(category) {
            return { "name": category.key, "children": 
              category.values.map( function(aff) {
                 return { "name": aff.key, "size": aff.value };
              }) 
            }; 
        })
    }; 

    var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

    var root = d3.hierarchy(nlByAffiliation)
        .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
        .sum(sumBySize)
        .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

    treemap(root);

    var cell = treemapSVG.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

    cell.append("rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d) { return color(d.parent.data.id); });

  cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; });

    cell.append("title")
        .text(function(d) { return d.data.id + "\n" + format(d.value); });

  d3.selectAll("input")
      .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
      .on("change", changed);

var timeout = d3.timeout(function() {
    d3.select("input[value=\"sumByCount\"]")
        .property("checked", true)
        .dispatch("change");
  }, 2000);


function changed(sum) {
    timeout.stop();

    treemap(root.sum(sum));

    cell.transition()
        .duration(750)
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
      .select("rect")
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; });

    //cell.selectAll("text").each(getSize).style("font-size", function(d) { return d.scale + 4 + "px"; });
  }
    
});

function sumBySize(d) {
  return d.size;
}

function sumByCount(d) {
  return d.children ? 0 : 1;
}

function getSize(d) {
  var bbox = this.getBBox(),
      cbbox = this.parentNode.getBBox(),
      scale = Math.min(cbbox.width/bbox.width, cbbox.height/bbox.height);
  d.scale = scale;
}