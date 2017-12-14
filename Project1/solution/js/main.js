
// **** Your JavaScript code goes here ****

var svg = d3.select('svg');

// Padding object to layout the SV
var padding = {t:100, r: 20, b: 80, l: 60};

// Get svg height dimensions
var chartDimen = {};
chartDimen.w = +svg.attr('width') / 2 - padding.l - padding.r;
chartDimen.h = +svg.attr('height') - padding.t - padding.b;

// Initialize a scale for the regions, still need domain
var regionScale = d3.scaleBand()
    .padding(0.4)
    .range([0,chartDimen.w]);

// Initialize a scale for the product categories, still need domain
var categoryScale = d3.scaleBand()
    .padding(0.4)
    .range([0,chartDimen.w]);

// Initialize y-scale for the heights of the bars
var yScale = d3.scaleLinear().range([0,chartDimen.h]);

// Initialize a color scale for the regions with d3-default colors
var regionColor = d3.scaleOrdinal(d3.schemeCategory10);

// Initialize a color scale for the product categories with custom colors
var categoryColor = d3.scaleOrdinal()
    .domain(['Coffee', 'Espresso', 'Tea', 'Herbal Tea'])
    .range(['#4e342f', '#bd6520', '#cd2818', '#beb66c'])

// Create to group elements for our charts, needed to keep elements separate
// VERY IMPORTANT when calling svg.selectAll('.bar')
regionChart = svg.append('g')
    .attr('transform', 'translate('+ [padding.l, padding.t] +')');
categoryChart = svg.append('g')
    .attr('transform', 'translate('+ [padding.l*2+padding.r+chartDimen.w, padding.t] +')');

d3.csv('./data/coffee_data.csv', function(error, coffeeData){
    // Handle loading errors
    if (error) {
        console.error('Error loading ./data/coffee_data.csv');
        console.error(error);
        return;
    }

    // Nest and rollup the data for region
    // Creates key-value pair array for each region, value = total sales
    var regionNested = d3.nest()
        .key(function(d){
            return d['region'];
        })
        .rollup(function(leaves){
            var salesTotal = d3.sum(leaves, function(d){
                return d['sales'];
            })
            return salesTotal;
        })
        .entries(coffeeData);

    // Nest and rollup the data for product category
    // Creates key-value pair array for each category, value = total sales
    var categoryNested = d3.nest()
        .key(function(d){
            return d['category'];
        })
        .rollup(function(leaves){
            var salesTotal = d3.sum(leaves, function(d){
                return d['sales'];
            })
            return salesTotal;
        })
        .entries(coffeeData);

    // Get the an array of strings for the region keys, regionKeys = ['Central', 'West', ...]
    var regionKeys = regionNested.map(function(d) {
        return d.key;
    });
    regionScale.domain(regionKeys);
    regionColor.domain(regionKeys);

    // Get the an array of strings for the category keys, categoryKeys = ['Tea', 'Coffee', ...]
    var categoryKeys = categoryNested.map(function(d) {
        return d.key;
    });
    categoryScale.domain(categoryKeys);

    // Compute the max sales for the category chart, use this input domain on both charts
    var maxSales = d3.max(regionNested.concat(categoryNested), function(d) {
        return d.value;
    });
    yScale.domain([0, maxSales]);

    // Create the bars for the region chart
    regionChart.selectAll('.bar') // Returns empty selection on parent region group
        .data(regionNested) // Bind region data
        .enter()
        .append('rect') // Append 4 new rect elements
        .attr('class', 'bar')
        .attr('x', function(d) { // x-position based on region key attribute
            return regionScale(d.key);
        })
        .attr('y', function(d) { // y-position based on difference btwn bar height and chart height
            return chartDimen.h - yScale(d.value);
        })
        .attr('width', regionScale.bandwidth()) // width uses band scale
        .attr('height', function(d) { // height based on total sales value
            return yScale(d.value);
        })
        .style('fill', function(d){ // Color based on region key
            return regionColor(d.key);
        });

        // Create the bars for the product chart
    categoryChart.selectAll('.bar') // Returns empty selection on parent region group
        .data(categoryNested) // Bind product data
        .enter()
        .append('rect') // Append 4 new rect elements
        .attr('class', 'bar')
        .attr('x', function(d) { // x-position based on category key attribute
            return categoryScale(d.key);
        })
        .attr('y', function(d) { // y-position based on difference btwn bar height and chart height
            return chartDimen.h - yScale(d.value);
        })
        .attr('width', categoryScale.bandwidth()) // width uses band scale
        .attr('height', function(d) { // height based on total sales value
            return yScale(d.value);
        })
        .style('fill', function(d){ // Color based on category key
            return categoryColor(d.key);
        });

    // Create a y-axis for both charts
    var yAxis = d3.axisLeft(yScale.range([chartDimen.h,0])) // flip the axis to render correctly
        .ticks(5)
        .tickFormat(function(t){
            return Math.round(t/1000) + 'k';
        })

    // Add both y-axes
    regionChart
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    categoryChart
        .attr('class', 'y axis')
        .call(yAxis);

    // Add both x-axes
    regionChart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+[0, chartDimen.h + 10]+')')
        .call(d3.axisBottom(regionScale));
    categoryChart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+[0, chartDimen.h + 10]+')')
        .call(d3.axisBottom(categoryScale));

});
// Any code outside of this block will not have immediate access to loaded data