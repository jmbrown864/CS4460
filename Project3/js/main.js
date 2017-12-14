// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateChart(event.value.newValue);
});

// Color mapping based on continents
var contintentColors = {Asia: '#fc5a74', Europe: '#fee633',
    Africa: '#24d5e8', Americas: '#82e92d', Oceania: '#fc5a74'};

// global variables
var svg = d3.select('svg');
var width = +svg.attr('width');
var height = +svg.attr('height');
var padding = {t: 50, r: 20, b: 50, l: 70};
var chartWidth = width - padding.l - padding.r;
var chartHeight = height - padding.t - padding.b;

var chart = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

var dataByYear;
var yScale;
var xScale;
var rScale;

d3.csv('./data/gapminder.csv',
    function(d){
        // This callback formats each row of the data
        return {
            country: d.country,
            year: +d.year,
            population: +d.population,
            continent: d.continent,
            lifeExp: +d.lifeExp,
            gdpPercap: +d.gdpPercap
        }
    },
    function(error, dataset){
        if(error) {
            console.error('Error while loading ./gapminder.csv dataset.');
            console.error(error);
            return;
        }

        // **** Set up your global variables and initialize the chart here ****
        dataByYear = d3.nest()
            .key(function(d) { return +d.year; })
            .object(dataset);

        var lifeExpectancy_Max = d3.max(dataset.map(a => +a.lifeExp));

        yScale = d3.scaleLinear()
            .domain([0, lifeExpectancy_Max])
            .range([0, chartHeight]);

        var yGrid = d3.axisLeft(yScale.range([chartHeight, 0]))
            .ticks(6)
            .tickSize(-chartWidth, 0, 0)
            .tickFormat('');

        svg.append('g')
            .attr('class', 'y-grid')
            .attr('transform', 'translate('+[padding.l, padding.t]+')')
            .call(yGrid);

        var yAxis = svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', 'translate('+[padding.l, padding.t]+')')
            .call(d3.axisLeft(yScale.range([chartHeight, 0])).ticks(6));

        var yLabel = svg.append('text')
            .attr('class', 'y-axis label')
            .attr('transform', 'translate(20, 30)')
            .text('Life Expectancy, Years');

        var gdpPerCap_Max = d3.extent(dataset.map(b => +b.gdpPercap));

        xScale = d3.scaleLog()
            .domain(gdpPerCap_Max)
            .range([0, chartWidth]);

        var xGrid = d3.axisBottom(xScale.range([0, chartWidth]))
            .tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000])
            .tickSize(-chartHeight, 0, 0)
            .tickFormat('');

        svg.append('g')
            .attr('class', 'x-grid')
            .attr('transform', 'translate('+[padding.l, chartHeight+padding.t]+')')
            .call(xGrid);

        var xAxis = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(' + [padding.l, chartHeight + padding.t] + ')')
            .call(d3.axisBottom(xScale.range([0, chartWidth])).tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]).tickFormat(d3.format("d")));

        var xLabel = svg.append('text')
            .attr('class', 'x-label')
            .attr('transform', 'translate('+[padding.l, height-15]+')')
            .text('Income per Person, GDP/Capita in $/year adjusted for inflation');

        var radiusMax = d3.max(dataset, function(d) {
            return d.population;
        });

        rScale = d3.scaleSqrt()
            .domain([0, radiusMax])
            .range([0, 50]);

        updateChart(1952);
    });

function updateChart(year) {
    // **** Update the chart based on the year here ****
    var thisYear = dataByYear[year];

    var countries = chart.selectAll('circle')
        .data(thisYear, function(d) {
            return d.country;
        });

    var countryEnter = countries.enter()
        .append('g')
        .attr('class', 'country');

    countries.merge(countryEnter)
        .attr('r', function(d) {
            return rScale(d.population);
        })
        .attr('cx', function(d) {
            return xScale(d.gdpPercap);
        })
        .attr('cy', function(d) {
            return yScale(d.lifeExp);
        })
        .attr('fill', function(d) {
            return contintentColors[d.continent];
        });

    countryEnter.append('circle')
        .attr('r', function(d) {
            return rScale(d.population);
        })
        .attr('cx', function(d) {
            return xScale(d.gdpPercap);
        })
        .attr('cy', function(d) {
            return yScale(d.lifeExp);
        })
        .attr('fill', function(d) {
            return contintentColors[d.continent];
        });

    countries.exit().remove();
}
