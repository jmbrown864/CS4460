function Timeline() {
	console.log("Timeline!");
}

Timeline.prototype.init = function(g, dataset) {
	console.log("Init!");

	this.g = g;
	this.dataset = dataset;

	var _this = this;

	var padding = {t: 20, r: 40, b: 110, l: 40},
		padding2 = {t: 430, r: 40, b: 30, l: 40}, //padding for the mini overview
		width = +g.attr('width') - padding.l - padding.r,
		height = +g.attr('height') - padding.t - padding.b,
		height2 = +g.attr('height') - padding2.t - padding2.b; // height for the mini overview

	var brush = d3.brushX()
		.extent([[0,0], [width, height2]])
		.on('brush end', brushed);

	var zoom = d3.zoom()
		.scaleExtent([1, Infinity])
		.translateExtent([1, Infinity])
		.extent([[0,0], [width, height]])
		.on('zoom', zoomed);

	var parseDate = d3.timeParse("%y");

	var x = d3.scaleTime().range([0, width]),
		x2 = d3.scaleTime().range([0, width]);

	var xAxis = d3.axisBottom(x);
		xAxis2 = d3.axisBottom(x2);

	x.domain(d3.extent(dataset, function(d) { return d.year; }));
	x2.domain(x.domain());

	var focus = g.append('g')
		.attr('class', 'focus')
		.attr('wdith', width)
		.attr('height', height)
		.attr('transform', 'translate(' + [padding.l, padding.t] + ')');

	focus.append('g')
		.attr('class', 'axis axis--x')
		.attr('transform', 'translate(' + [0, height] + ')')
		.call(xAxis.tickFormat(d3.format('.0f')));

	var context = g.append('g')
		.attr('class', 'context')
		.attr('width', width)
		.attr('height', height)
		.attr('transform', 'translate(' + [padding2.l, padding2.t] + ')');

	context.append('g')
		.attr('class', 'axis axis--x')
		.attr('transform', 'translate(' + [0, height2] + ')')
		.call(xAxis2.tickFormat(d3.format('.0f')));

	context.append('g')
		.attr('class', 'brush')
		.call(brush)
		.call(brush.move, x.range());

	g.append('rect')
		.attr('class', 'zoom')
		.attr('width', width)
		.attr('height', height)
		.attr('transform', 'translate(' + [padding.l, padding.t] + ')')
		.style('cursor', 'move')
		.style('fill', 'none')
		.style('pointer-events', 'all')
		.call(zoom);

	function brushed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		var s = d3.event.selection || x2.range();
		x.domain(s.map(x2.invert, x2));
		focus.select(".axis--x").call(xAxis);
		g.select(".zoom").call(zoom.transform, d3.zoomIdentity
			.scale(width / (s[1] - s[0]))
			.translate(-s[0], 0));
	}

	function zoomed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		var t = d3.event.transform;
		x.domain(t.rescaleX(x2).domain());
		focus.select(".axis--x").call(xAxis);
		context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
	}

	function type(d) {
		d.date = parseDate(d.date);
		return d;
	}
}

Timeline.prototype.update = function() {

	var _this = this;

}