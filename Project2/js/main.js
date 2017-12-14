d3.csv('./data/real_estate.csv', function(error, data) {
	
	var svg = d3.select('svg');
	var width = +svg.attr('width');
	var height = +svg.attr('height');
	var padding = {t: 10, r: 10, b: 30, l: 30};
	var plotWidth = width / 2 - padding.l - padding.r;
	var plotHeight = height / 2 - padding.t - padding.b;

	var dataByLocation = d3.nest()
						.key(function(d) { return d.location; })
						.entries(data);

	var ppsqft_Max = d3.max(data.map(a => +a.price_per_sqft));

	var yearBuilt = data.map(b => +b.year_built);
	var yearBuilt_Max = d3.max(yearBuilt);
	var yearBuilt_Min = d3.min(yearBuilt);
	
	var yScale = d3.scaleLinear()
				.domain([0, ppsqft_Max])
				.range([0, plotHeight-30]);

	var xScale = d3.scaleLinear()
				.domain([yearBuilt_Min, yearBuilt_Max])
				.range([0, plotWidth-30]);

	var xOffset = 30; 

	var cityPlots = svg.selectAll('.city-plot')
					.data(dataByLocation)
					.enter()
					.append('g')
					.attr('class', 'city-plot')
					.attr('transform', function(d, i) {
						var tx = (i % 2) * (plotWidth + padding.l + padding.r) + padding.l;
        				var ty = Math.floor(i / 2) * (plotHeight + padding.t + padding.b) + padding.t;
        				return 'translate('+[tx, ty]+')';
					});

	cityPlots.append('g')
			 .attr('class', 'y-axis')
			 .attr('transform', function() {
			 	return 'translate(' + xOffset + ',0)';
			 })
			 .call(d3.axisLeft(yScale.range([plotHeight-30, 0])));

	cityPlots.append('g')
			 .attr('class', 'x-axis')
			 .attr('transform', function() {
			 	return 'translate(' + xOffset + ',' + (plotHeight-30) + ')';
			 })
			 .call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format("d")));

	cityPlots.append('text')
			 .attr('class', 'city-label')
			 .attr('font-size', '14px')
			 .attr('transform', function() {
			 	return 'translate(130, 40)';
			 })
			 .text(function(d) {
			 	return d.key;
			 });

	cityPlots.append('text')
			 .attr('class', 'x axis label')
			 .attr('font-size', '12px')
			 .attr('transform', 'translate('+ (plotWidth/2) + ',' + (plotHeight+5) + ')')
			 .text("Year Built");

	cityPlots.append('text')
			 .attr('class', 'y axis label')
			 .attr('font-size', '12px')
			 .attr('transform', 'translate(-10,' + (plotHeight-80) + ') rotate(-90)')
			 .text("Price Per Square Foot (USD)");

	cityPlots.selectAll('.home-data')
		.data(function(d, i) {
			return d.values;
		})
		.enter()
		.append('circle')
		.attr('class', 'home-data')
		.attr('r', '2')
		.attr('cx', function(d) {
			return xScale(d.year_built)+xOffset;
		})
		.attr('cy', function(d) {
			return yScale(d.price_per_sqft)+6;
		})
		.attr('fill', function(d) {
			if (d.beds <= 2) {
				return '#499936';
			} else if (d.beds > 2) {
				return '#2e5d90';
			}
		})
		.attr('fill-opacity', '0.7');
});