function Timeline() {
	console.log("Timeline!");
}

Timeline.prototype.init = function(g, dataset) {
	this.g = g;
	this.dataset = dataset;

	var _this = this;

	var padding = {t: 20, r: 40, b: 110, l: 60},
		width = +g.attr('width') - padding.l - padding.r,
		height = +g.attr('height') - padding.t - padding.b,
		padding2 = {t: (+g.attr('height')-height), r: 40, b: 30, l: 60}, //padding for the mini overview
		height2 = +g.attr('height') - padding2.t - padding2.b; // height for the mini overview

	// var color = d3.scaleOrdinal(d3.schemeCategory10);
	var color = d3.scaleOrdinal()
        .domain(["medicine", "peace", "chemistry", "literature", "physics", "economics"])
        .range(["#c2ddad", "#adc9dd", "#efab58", "#ffd026", "#d3baff", "#ed5e5e"]);

 //    var brush = d3.brushX()
	// 	.extent([[0,0], [width, height]])
	// 	.on('brush end', brushed);

	// var zoom = d3.zoom()
	// 	.scaleExtent([1, Infinity])
	// 	.translateExtent([1, Infinity])
	// 	// .extent([[0,0], [width, height]])
	// 	.on('zoom', zoomed);

	var tooltip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-12, 0])
		.html(function(d) {
			return '<div id="tooltip" width="100"> <h5> Awarded to <b>' + d.fullname + '</b> ' + d.motivation + '</h5></div>'
		});

	g.call(tooltip);

	var x = d3.scaleTime()
		.domain(d3.extent(dataset.map(function(d) {
			return d.year;
		})))
		.range([0, width]);

	var x2 = d3.scaleTime()
		.domain(d3.extent(dataset.map(function(d) {
			return d.year;
		})))
		.range([0, width]);

	var y = d3.scaleBand()
		.domain(dataset.map(function(d) {
			return d.category;
		}))
		.rangeRound([0, height])
		.paddingInner(0.2);

	// var context = g.append('g')
	// 	.attr('class', 'context')
	// 	.attr('transform', 'translate(' + [padding2.l, padding2.t] + ')')
	// 	.attr('width', width)
	// 	.attr('height', height2);

	// context.append('g')
	// 	.attr('class', 'x-axis')
	// 	.attr('transform', 'translate(' + [0, height2] + ')')
	// 	.call(d3.axisBottom(x2).tickFormat(d3.format('.0f')));

	// context.append('g')
	// 	.attr('class', 'brush')
	// 	.call(brush)
	// 	.call(brush.move, x.range());

	var container = g.append('g')
		.attr('class', 'container')
		.attr('transform', 'translate(' + [padding.l, padding.t] + ')')
		.attr('width', width)
		.attr('height', height);

	container.append('g')
		.attr('class', 'x-axis')
		.attr('transform', 'translate(' + [0, height] + ')')
		.call(d3.axisBottom(x).tickFormat(d3.format('.0f')));

	container.append('g')
		.attr('class', 'y-axis')
		.call(d3.axisLeft(y))
		.selectAll('text')
		.attr('dx', '30')
		.attr('dy', '-30')
		.attr('transform', 'rotate(-90)');

	var category_container = container.selectAll('category-container')
		.data(y.domain())
		.enter()
		.append('g')
		.attr('class', function(d) {
			return 'category-container --' + d + '';
		})
		.attr('transform', function(d) { 
			return 'translate(' + [0, y(d)] + ')'; 
		});

	var age = d3.scaleLinear()
		.domain(d3.extent(dataset.map(function(d) {
			return d.age;
		})))
		.range([y.bandwidth(), 0]);

	category_container.append('g')
		.attr('class', 'age x-axis')
		.call(d3.axisLeft(age));

	var nest_data = d3.nest()
		.key(function(d) { return d.category; })
		.entries(dataset);

	category_container.selectAll('.dot')
		.data(function(d, i) {
			return nest_data[i].values;
		})
		.enter()
		.append('circle')
		.attr('class', 'dot')
		.attr('r', 2.5)
		.attr('cx', function(d) {
			return x(d.year);
		})
		.attr('cy', function(d) {
			return age(d.age);
		})
		.attr('fill', function(d) {
			return color(d.category);
		}).
		attr('stroke', function(d) {
			if (d.gender == 'female') return '#000';
		})
		.on('mouseover', tooltip.show)
		.on('mouseout', tooltip.hide);


	// container.append('rect')
	// 	.attr('class', 'zoom')
	// 	.attr('width', width)
	// 	.attr('height', height)
	// 	// .attr('transform', 'translate(' + [padding.l, padding.t] + ')')
	// 	.style('cursor', 'move')
	// 	.style('fill', 'none')
	// 	.style('pointer-events', 'all')
	// 	.call(zoom);

	// function brushed() {
	// 	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
	// 	var s = d3.event.selection || x2.range();
	// 	x.domain(s.map(x2.invert, x2));
	// 	// focus.selectAll('circle').attr('cx', function(d) { return x(d.year); });
	// 	// container.select("x-axis").call(x);
	// 	g.select(".zoom").call(zoom.transform, d3.zoomIdentity
	// 		.scale(width / (s[1] - s[0]))
	// 		.translate(-s[0], 0));
	// }

	// function zoomed() {
	// 	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
	// 	var t = d3.event.transform;
	// 	x.domain(t.rescaleX(x).domain());
	// 	container.select("x-axis").call(x);
	// 	container.select(".brush").call(brush.move, x.range().map(t.invertX, t));
	// }
}

Timeline.prototype.update = function() {

	var _this = this;

}