// Color mapping based on year
var yearColors = {2000: '#8c8c8c', 2010: '#d86763'};
var valueColors = ['#fcc9b5','#fa8873','#d44951','#843540'];
var densityColorScale = d3.scaleThreshold().range(valueColors).domain([5000,10000,15000]);
var popColorScale = d3.scaleThreshold().range(valueColors).domain([500000, 1000000, 5000000]);
var landColorScale = d3.scaleThreshold().range(valueColors).domain([200, 500, 1000]);

var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');

var histContPadding = {t: 75, b: 50, l: 250, r: 10}; //padding for the histogram's container
var histContWidth = width - histContPadding.l - histContPadding.r; //width of the histogram container
var histContHeight = height - histContPadding.t - histContPadding.b; //height of the histogram continer
var histPadding = 30; //arbitrary number, spacing between each histogram
var histWidth = (histContWidth/3)-histPadding; //width of individual histograms

var histogram_container = svg.append('g') //container holding all three of the histograms
    .attr('class', 'histogram-charts')
    .attr('width', histContWidth)
    .attr('height', histContHeight)
    .attr('transform', 'translate(' + [histContPadding.l, histContPadding.t] + ')');

var yScale = d3.scaleLinear().domain([0, 140]).rangeRound([0, histContHeight]);

var barChartHeight = 350;
var barChartsWidth = histWidth - 70; //width of individual charts
var barContPadding = {t:10, l: 30}

var barCharts_container = svg.append('g') //container for all bar charts
    .attr('class', 'bar-charts')
    .attr('width', histContWidth)
    .attr('height', barChartHeight)
    .attr('transform', 'translate(' + [histContPadding.l, barContPadding.t] + ')');

var brushChart;

var brush = d3.brushX()
    .extent([[0, 0], [histWidth, histContHeight]])
    .on('start', brushstart)
    .on('brush', brushmove)
    .on('end', brushend);

var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>" + d['city']+ ',' + d['country'] + "</h5>" 
            + "<table>"
            + "<thead><tr><td>Density 2000</td><td>Density 2010</td><td>Density Growth</td></tr></thead>"
            + "<tbody><tr><td>" + d['density_2000'] + "</td><td>" + d['density_2010'] + "</td><td>" + d['density_growth'] + "</td></tr></tbody>"
            + "<thead><tr><td>Population 2000</td><td>Population 2010</td><td>Population Growth</td></tr></thead>"
            + "<tbody><tr><td>" + d['pop_2000'] + "</td><td>" + d['pop_2010'] + "</td><td>" + d['pop_growth'] + "</td></tr></tbody>"
            + "<thead><tr><td>Land 2000</td><td>Land 2010</td><td>Land Growth</td></tr></thead>"
            + "<tbody><tr><td>" + d['land_2000'] + "</td><td>" + d['land_2010'] + "</td><td>" + d['land_growth'] + "</td></tr></tbody>"
            + "</table>";
    });

/* REUSABLE HISTOGRAM COMPONENT */
function Histogram(x, y, data, attr) {
    this.x = x;
    this.y = y;
    this.data = data;
    this.attr = attr;

    this.init(data, attr);

    // console.log('Create histogram object!');
}

Histogram.prototype.init = function(data, attr) {

    // console.log("Inside intialization function!");

    // console.log("Histogram data: " + data);
    // console.log(attr + '_2010');

    var _hist = this;
    this.xScale = d3.scaleLinear().range([0, histWidth])
        .domain(d3.extent(data.map(function(d) {
            return d[attr + '_growth'];
        })));

    var xAxis = d3.axisBottom(this.xScale).tickFormat(d3.format(".0%")).ticks(8);
    var yAxis = d3.axisLeft(yScale.range([histContHeight, 0])).tickValues([0, 20, 40, 60, 80, 100, 120, 140])

    var histogram = histogram_container.selectAll('.histogram.'+this.attr)
        .data([this])
        .enter()
        .append('g')
        .attr('class', 'histogram '+this.attr)
        .attr('width', histWidth)
        .attr('height', histContHeight)
        .attr('transform', 'translate(' + [this.x + histPadding, this.y] + ')');

    histogram.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(' + [0, histContHeight] + ')')
        .call(xAxis);

    histogram.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + [0, 0] + ')')
        .call(yAxis);

    var hist = d3.histogram()
        .domain(this.xScale.domain())
        .thresholds(this.xScale.ticks(80))
        .value(d => d[attr + '_growth']); //says to use growth attr of data when calling hist(data)

    var bins = hist(data);
    // console.log(bins);

    var binContainer = histogram.selectAll('.bin').data(bins);

    var binContainerEnter = binContainer.enter()
        .append('g')
        .attr('class', 'bin')
        .attr('transform', function(d) {
            return 'translate(' + [_hist.xScale(d.x0), histContHeight-3] + ')';
        });

    var dots = binContainerEnter.selectAll('circle')
        .data(function(d) {
            // console.log(d);
            var newData = d.map(function(data, i) {
                // console.log(data);
                return {
                    idx: i,
                    city: data.city,
                    density_2000: data.density_2000,
                    density_2010: data.density_2010,
                    pop_2000: data.pop_2000,
                    pop_2010: data.pop_2010,
                    land_2000: data.land_2000,
                    land_2010: data.land_2010,
                    growth: data[attr + '_growth'],
                    density_growth: data.density_growth,
                    pop_growth: data.pop_growth,
                    land_growth: data.land_growth,
                    year_2010: data[attr + '_2010'],
                    country: data.country,
                    radius: 2
                }
            }); 
            // console.log(newData);
            return newData;
        })
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', 0) //because bin is already at correct x location
        .attr('cy', function(d) {
            return -(d.idx * 2 * d.radius - d.radius);
        })
        .attr('r', function(d) {
            return d.radius;
        })
        .style('fill', function(d) {
            if (attr == 'density') return densityColorScale(d.year_2010);
            if (attr == 'pop') return popColorScale(d.year_2010);
            if (attr == 'land') return landColorScale(d.year_2010);
        });

    legend(histogram, attr);

    histogram.append('g')
        .attr('class', 'brush')
        .call(brush);

    dots.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);
}

function legend(hist, attr) {
    var legend_rect_size = 15;

    var legendObjects;
    var legend_title;
    if (attr == 'density') {
        legendObjects = valueColors.map(function(color) { return {legend:densityColorScale.invertExtent(color), color: color};}).reverse();
        legend_title = "Urban Density - 2010";
    }

    if (attr == 'pop') {
        legendObjects = valueColors.map(function(color) { return {legend:popColorScale.invertExtent(color), color: color};}).reverse();
        legend_title = "Urban Population - 2010";
    }

    if (attr == 'land') {
        legendObjects = valueColors.map(function(color) { return {legend:landColorScale.invertExtent(color), color: color};}).reverse();
        legend_title = "Urban Land - 2010";
    }

    var formatNum = d3.format(".1s");

    var legend = hist.append('g')
        .attr('class', 'legend');

    legend.append('text')
        .attr('x', 230)
        .attr('y', 440)
        .style('font-size', '12px')
        .text(legend_title);

    var item = legend.append('g')
        .attr('class', 'legend-item');

    item.selectAll('rect')
        .data(legendObjects)
        .enter()
        .append('rect')
        .attr('width', legend_rect_size)
        .attr('height', legend_rect_size)
        .attr('x', 275)
        .attr('y', function(d, i) {
            return 450 + (i * legend_rect_size);
        })
        .attr('fill', function(d) {
            return d.color;
        });

    item.selectAll('text')
        .data(legendObjects)
        .enter()
        .append('text')
        .style('font-size', '10px')
        .attr('x', 295)
        .attr('y', function(d, i) {
            return 450 + (i * legend_rect_size) + 10;
        })
        .text(function(d) {
            var label;

            if (d.legend[0] == undefined) {
                label = '< ' + formatNum(d.legend[1]);
            } else if (d.legend[1] == undefined) {
                label = '> ' + formatNum(d.legend[0]);
            } else  {
                label = formatNum(d.legend[0]) + '-' + formatNum(d.legend[1]);
            }

            return label;
        });
}

/* REUSABLE BAR CHART COMPONENT */
function BarChart(x, y, data, label) {
    this.x = x;
    this.y = y;
    this.data = data;
    this.label = label;

    this.init(data, label);

    // console.log("Bar chart created!");
}

BarChart.prototype.init = function(data, label) {
    var bar_chart = barCharts_container.append('g')
        .attr('class', 'bar-chart')
        .attr('width', barChartsWidth)
        .attr('height', barChartHeight)
        .attr('transform', 'translate(' + [this.x, this.y] + ')');

    bar_chart.append('rect')
        .attr('stroke', '#777')
        .attr('stroke-opacity', '0.5')
        .attr('fill', 'white')
        .attr('fill-opacity', '0.5')
        .attr('width', +bar_chart.attr('width'))
        .attr('height', +bar_chart.attr('height'));

    bar_chart.append('text')
        .attr('class', 'density-label')
        .attr('transform', 'translate(30, 15)')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(label);

    var chartPadding = {t:20, b:10, l:100, r: 10};
    var axisHeight = barChartHeight - chartPadding.t - chartPadding.b;
    var axisWidth = barChartsWidth - chartPadding.l - chartPadding.r;

    var x0 = d3.scaleBand()
        .rangeRound([0, axisHeight-10])
        .domain(data.map(function(d) {
            return d.key; 
        }));

    var x1 = d3.scaleBand()
        .domain(["year_2000", "year_2010"])
        .rangeRound([0, x0.bandwidth()]);

    /* temp fix for getting max data value */
    densities = []

    data.forEach(function(d) {
        densities.push(d.value.year_2000);
        densities.push(d.value.year_2010);
    });

    var maxValue = d3.max(densities);
    // console.log(maxValue);
    /* end temp fix*/

    var y = d3.scaleLinear()
        .rangeRound([axisWidth, 0])
        .domain([maxValue, 0]);

    var i = 0; //counter for spacing bars
    bar_chart.selectAll('.bar-2000')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', '#8c8c8c')
        .attr('height', 4)
        .attr('width', function(d) {
            return y(d.value.year_2000);
        })
        .attr('y', function(d) {
            return (10.5 + chartPadding.t - 4) + (i++*17);
        })
        .attr('x', chartPadding.l)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

    var i = 0;
    bar_chart.selectAll('.bar-2010')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', '#d86763')
        .attr('height', 4)
        .attr('width', function(d) {
            return y(d.value.year_2010);
        })
        .attr('y', function(d) {
            return (10.5 + chartPadding.t) + (i++*17);
        })
        .attr('x', chartPadding.l)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

    bar_chart.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + [chartPadding.l, chartPadding.t] +')')
        .call(d3.axisLeft(x0));

    bar_chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(' + [chartPadding.l, axisHeight + chartPadding.b] + ')')
        .call(d3.axisBottom(y).ticks(5).tickFormat(d3.format(".1s")));

}

// Dataset from http://nbremer.github.io/urbanization/
d3.csv('./data/asia_urbanization.csv',
function(row){
    // This callback formats each row of the data
    return {
        city: row.city,
        country: row.country,
        type_country: row.type_country,
        land_2000: +row.land_2000,
        land_2010: +row.land_2010,
        land_growth: +row.land_growth,
        pop_2000: +row.pop_2000,
        pop_2010: +row.pop_2010,
        pop_growth: +row.pop_growth,
        density_2000: +row.density_2000,
        density_2010: +row.density_2010,
        density_growth: +row.density_growth
    }
},
function(error, dataset){
    if(error) {
        console.error('Error while loading ./data/asia_urbanization.csv dataset.');
        console.error(error);
        return;
    }

    // **** Your JavaScript code goes here ****
    dataset.sort(function(a,b) {
            return d3.descending(a.density_2010, b.density_2010);
        });
    var density_hist = new Histogram(0, 0, dataset, "density");

    dataset.sort(function(a,b) {
                return d3.descending(a.pop_2010, b.pop_2010);
            });
    new Histogram(histWidth + histPadding, 0, dataset, "pop");

    dataset.sort(function(a,b) {
                return d3.descending(a.land_2010, b.land_2010);
            });
    new Histogram((histWidth + histPadding) * 2, 0, dataset, "land");

    var density = d3.nest()
        .key(function(d) { return d.country; })
        .rollup(function(values) {
            var year_2000 = d3.mean(values, function(d) { return d.density_2000; });
            var year_2010 = d3.mean(values, function(d) { return d.density_2010; });

            return {
                country: values[0].country,
                year_2000: year_2000,
                year_2010: year_2010
            }
        })
        .entries(dataset);
    
    density.sort(function(a,b) {
            return d3.descending(a.value.year_2010, b.value.year_2010);
        });

    new BarChart(histWidth - barChartsWidth + barContPadding.l, 0, density, "Avg. Population Density (in persons/sq. km)")

    var population = d3.nest()
        .key(function(d) { return d.country; })
        .rollup(function(values) {
            var year_2000 = d3.sum(values, function(d) { return d.pop_2000; });
            var year_2010 = d3.sum(values, function(d) { return d.pop_2010; });

            return {
                country: values[0].country,
                year_2000: year_2000,
                year_2010: year_2010
            }
        })
        .entries(dataset);

    population.sort(function(a,b) {
            return d3.descending(a.value.year_2010, b.value.year_2010);
        });

    new BarChart(histWidth + histPadding + barContPadding.l*3 + 10, 0, population, "Urban Population");

    var land = d3.nest()
        .key(function(d) { return d.country; })
        .rollup(function(values) {
            var year_2000 = d3.sum(values, function(d) { return d.land_2000; });
            var year_2010 = d3.sum(values, function(d) { return d.land_2010; });

            return {
                country: values[0].country,
                year_2000: year_2000,
                year_2010: year_2010
            }
        })
        .entries(dataset);

    land.sort(function(a,b) {
            return d3.descending(a.value.year_2010, b.value.year_2010);
        });

    new BarChart(((histWidth + histPadding)*2) + barContPadding.l*3 + 5, 0, land, "Urban Land");

    svg.call(toolTip);
});

// function toolTipHover(city) {
//     svg.selectAll('.data-point')
//     .classed('hidden', function(d) {
//         return city !== city.value.city;
//     }); 

//     toolTip.show;
// }

// function toolTipExit() {
//     svg.selectAll('.hidden')
//         .classed('hidden', false);

//     toolTip.hide;    
// }

function mouseover(country) {
    // console.log('Enter hover');
    
    svg.selectAll('.bar')
        .classed('hidden', function(d) {
            // console.log(d.value.country == country.value.country);
            return d.value.country !== country.value.country;
        });

    svg.selectAll('.data-point')
        .classed('hidden', function(d) {
            return d.country !== country.value.country;
        }); 
}

function mouseout(country) {
    // console.log('Exit hover');

    svg.selectAll('.hidden')
        .classed('hidden', false);
}

function brushstart(cell) {
    // cell is the SplomCell object

    // Check if this g element is different than the previous brush
    if(brushCell !== this) {

        // Clear the old brush
        brush.move(d3.select(brushCell), null);


        // Save the state of this g element as having an active brush
        brushCell = this;
    }
}

function brushmove(hist) {
    // cell is the SplomCell object
    console.log(hist);

    // Get the extent or bounding box of the brush event, this is a 2x2 array
    var e = d3.event.selection;
    if(e) {

        // Select all .dot circles, and add the "hidden" class if the data for that circle
        // lies outside of the brush-filter applied for this SplomCells x and y attributes
        svg.selectAll(".data-point")
            .classed("hidden", function(d,i){
                return e[0] > hist.xScale(d[hist.attr + '_growth']) || hist.xScale(d[hist.attr + '_growth']) > e[1];
            });
    }
}

function brushend() {
    // If there is no longer an extent or bounding box then the brush has been removed
    if(!d3.event.selection) {
        // Bring back all hidden .dot elements
        svg.selectAll('.hidden').classed('hidden', false);
        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
    }
}