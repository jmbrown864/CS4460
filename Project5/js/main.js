var padding = {t: 40, r: 40, b: 40, l: 40};

timelineSVG = d3.select(".timeline");
timelineWidth = timelineSVG.attr("width");
timelineHeight = timelineSVG.attr("height");
timelineSVG.attr("transform", "translate(" + [((window.innerWidth - timelineWidth)/2), ((window.innerHeight - timelineHeight)/2)] + ")");

d3.csv('./data/nobel_laureates.csv', function(error, data) {
    if (error) throw error; 

    var nlByAff = d3.nest().key(function(d) {
        return d.category;
    }).key(function(e) {
        if (e.affiliation_country === "") {
            return "No Affiliation Country";
        }
        return e.affiliation_country;
    }).key(function(z) {
        if (z.affiliation === "none") {
            return "No Affiliation";
        }
        return z.affiliation;
    }).rollup(function(v) {
        return v.length;
    }).entries(data);
    nlByAff = nlByAff.sort(function(a, b) {
        return d3.sum(b.values, function(c) { 
            return d3.sum(c.values, function(d) {
                return d.value;
            }); 
        }) - d3.sum(a.values, function(c) { 
            return d3.sum(c.values, function(d) {
                return d.value;
            }); 
        });
    });
    nlByAff.forEach((category) => {
        category.values.sort(function(a, b) {
            return d3.sum(b.values, function(t) {
                return t.value;
            }) - d3.sum(a.values, function(t) {
                return t.value;
            });
        });
        category.values.forEach((country) => {
            country.values.sort(function(a,b) {
                return b.value - a.value;
            });
        });
    });

    nlByAff = {"key": "Nobel Laureates", "values": nlByAff}; 
    nlByAff = { "name": "Nobel Laureates", "label": "Nobel Laureates", "children":
        nlByAff.values.map( function(category) {
            return { "name": category.key, "label": category.key, "children": 
              category.values.map( function(country) {
                 return { "name": country.key, "label": country.key, "children": 
                    country.values.map(function(aff) {
                        return {"name": aff.key, "label": aff.key, "size": aff.value}
                    }) 
                };
              }) 
            }; 
        })
    }; 



    var color = d3.scaleOrdinal()
        .domain(["medicine", "peace", "chemistry", "literature", "physics", "economics"])
        .range(["#c2ddad", "#adc9dd", "#efab58", "#ffd026", "#d3baff", "#ed5e5e"]);

    var root = d3.hierarchy(nlByAff);
    d3ZoomableTreemap('treemap', root, {
        sum_function: function(d) {
                    if (!d.hasOwnProperty('children'))
                        return d.size;
                    else
                        return 0.0;
                }, 
        height: 840,
        margin_top: 60,
        zoom_out_msg: " - click here to zoom out",
        zoom_in_msg: " - click subcategories to zoom in",
        fill_color: "#fff",
        color_scale: color,
        format_number: function (number) {
            switch (number) {
                case 1:
                    return number + " record";
                default:
                    return number + " records";
            }            
        }
    }); 

    var listAff = d3.nest().key(function(d) {
        return d.affiliation;
    }).rollup(function(e) {
        return {
            "name": e.fullname,
            "description": e.motivation
        };
    }).entries(data);   
   		
    var timeline = new Timeline();
 		timeline.init(timelineSVG, data);
});