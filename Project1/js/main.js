//+.attr('height') will return the height as an int
//.style('stroke')

d3.csv("./data/coffee_data.csv", function(error, data) {

	var svg = d3.select("svg");
	svg.style('padding', '20px');
	var width = svg.attr('width');
	var height = svg.attr('height');
	var padding = .2;
	var barPadding = .2;

	//REGION ==============================================================

	//aggregate sales by region
	var regionSales = d3.nest().key(function(data){
		return data.region; })
	.rollup(function(leaves) {
		return d3.sum(leaves, function(d){
			return d.sales;
		});
	}).entries(data);
	console.log(regionSales);

	//scales and other region variables	
	var regionKeys = regionSales.map(function(d) { return d.key; });
	var regionValues = regionSales.map(function(d) { return d.value; });
	console.log("Region Keys: " + regionKeys);
	console.log("Region Values: " + regionValues);

	var regionMax = d3.max(regionValues);
	
	var regionScaleY = d3.scaleLinear()
						 .domain([0, regionMax])
						 .range([0, 480]);

	var regionScaleX = d3.scaleBand()
					     .domain(regionKeys)
					     .range([0, 310]);

	//bars
	var myColor = d3.rgb(100, 100, 100);

	svg.append('g')
		.selectAll('rect')
		.data(regionSales)
		.enter()
		.append('rect')
		.attr('fill', function(d, i) {
			if (i == 0) return d3.rgb(255, 194, 59);
			if (i == 1) return d3.rgb(232, 69, 54);
			if (i == 2) return d3.rgb(54, 182, 232);
			if (i == 3) return d3.rgb(58, 196, 53);
		})
		.attr('x', function(d, i) {
			return i*[310/regionSales.length] + 70;
		})
		.attr('y', function(d) {
			return height - regionScaleY(d.value) - (height-540);
		})
		.attr('width', ((310)/2)/regionSales.length - barPadding)
		.attr('height', function(d) {
			return regionScaleY(d.value);
		});

	//axis and labels
	svg.append('text')
	   .attr('class', 'region title')
	   .attr('font-weight', 'bold')
	   .attr('transform', 'translate(100, 30)')
	   .text('Coffee Sales by Region (USD)');

	svg.append('g')
	   .attr('class', 'y axis')
	   .attr('transform', 'translate(50, 60)')
	   .call(d3.axisLeft(regionScaleY.range([480, 0])).ticks(7).tickFormat(d3.format(".2s")));

	svg.append('text')
	   .attr('class', 'region y label')
	   .attr('font-size', '14px')
	   .attr('transform', 'translate(0, 350) rotate(-90)')
	   .text("Coffee Sales (USD)");   

	svg.append('g')
	   .attr('class', 'x axis')
	   .attr('transform', 'translate(50, 540)')
	   .call(d3.axisBottom(regionScaleX));

	svg.append('text')
		.attr('class', 'region x label')
		.attr('font-size', '14px')
		.attr('transform', function(d) {
			return 'translate(' + (width/4-20) + ',' + 580 + ')';
		})
		.text('Region');


	//CATEGORY =========================================================

	//aggregate sales by category
	var categorySales = d3.nest().key(function(d){
		return d.category; })
	.rollup(function(leaves) {
		return d3.sum(leaves, function(d){
	    	return d.sales;
		});
	}).entries(data);

	console.log(categorySales);

	//scales and other category variables
	var catKeys = categorySales.map(function(d) { return d.key; });
	var catVals = categorySales.map(function(d) { return d.value; });
	console.log("Keys:" + catKeys);
	console.log('Key Length: ' + catKeys.length);
	console.log("Values: " + catVals);

	var catMax = d3.max(catVals);
	console.log("Cat Max: " + catMax);

	var catScaleY = d3.scaleLinear()
					  .domain([0, catMax])
					  .range([0, 480]);

	var catScaleX = d3.scaleBand()
					  .domain(categorySales.map(function(d) { return d.key; }))
					  .range([0, 310]);

	//bars
	svg.append('g')
		.selectAll('rect')
		.data(categorySales)
		.enter()
		.append('rect')
		.attr('fill', function(d, i) {
			if (i == 0) return d3.rgb(64, 199, 136);
			if (i == 1) return d3.rgb(217, 232, 75);
			if (i == 2) return d3.rgb(255, 187, 95);
			if (i == 3) return d3.rgb(232, 75, 119);
		})
		.attr('x', function(d, i) {
			return i*[310/categorySales.length] + 460;
		})
		.attr('y', function(d) {
			return height - catScaleY(d.value) - (height-540);
		})
		.attr('width', ((310)/2)/categorySales.length - barPadding)
		.attr('height', function(d) {
			return catScaleY(d.value);
		});

	//axis and labels
	svg.append('text')
		.attr('class', 'category title')
		.attr('font-weight', 'bold')
		.attr('transform', 'translate(480, 30)')
		.text('Coffee Sales by Category (USD)');

	svg.append('g')
		   .attr('class', 'y axis')
		   .attr('transform', 'translate(440, 60)')
		   .call(d3.axisLeft(regionScaleY.range([480, 0])).ticks(7).tickFormat(d3.format(".2s")));

	svg.append('text')
	   .attr('class', 'region y label')
	   .attr('font-size', '14px')
	   .attr('transform', 'translate(390, 350) rotate(-90)')
	   .text("Coffee Sales (USD)");

	svg.append('g')
	   .attr('class', 'category x axis')
	   .attr('transform', 'translate(440, 540)')
	   .call(d3.axisBottom(catScaleX));

	svg.append('text')
		.attr('class', 'region x label')
		.attr('font-size', '14px')
		.attr('transform', function(d) {
			return 'translate(' + (width/4*3) + ',' + 580 + ')';
		})
		.text('Category');
});