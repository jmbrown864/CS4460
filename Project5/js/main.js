var padding = {t: 40, r: 40, b: 40, l: 40};

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
    nlByAffiliation = { "name": "Nobel Laureates", "label": "Nobel Laureates", "children":
        nlByAffiliation.values.map( function(category) {
            return { "name": category.key, "label": category.key, "children": 
              category.values.map( function(aff) {
                 return { "name": aff.key, "label": aff.key, "size": aff.value };
              }) 
            }; 
        })
    }; 

    var root = d3.hierarchy(nlByAffiliation);
    d3ZoomableTreemap('treemap', root, {
        sum_function: function(d) {
                    if (!d.hasOwnProperty('children'))
                        return d.size;
                    else
                        return 0.0;
                }, 
        height: 840,
        margin_top: 60,
        zoom_out_msg: "- click here to zoom out",
        zoom_in_msg: "- click subcategories to zoom in",
        fill_color: "#EDC4BD",
        format_number: d3.format(".1f")
    });
    
});