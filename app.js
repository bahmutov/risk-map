/*! risk-map-0.0.1 built on Mon Jul 29 2013 19:53:06 by Gleb Bahmutov */

(function (d3) {
  var w = window.innerWidth * 0.8,
  h = window.innerHeight * 0.75,
  x = d3.scale.linear().range([0, w]),
  y = d3.scale.linear().range([0, h]),
  color = d3.scale.category20c(),
  root,
  node;

  var treemap = d3.layout.treemap()
  .round(false)
  .size([w, h])
  .sticky(true)
  .value(getMetric.bind(null, 'loc'));

  var svg = d3.select('#body').append('div')
  .attr('class', 'chart')
  .style('width', w + 'px')
  .style('height', h + 'px')
  .append('svg:svg')
  .attr('width', w)
  .attr('height', h)
  .append('svg:g')
  .attr('transform', 'translate(.5,.5)');

  function loadData(filename, cb) {
    d3.json(filename, cb);
  }

  function vizData(data) {
    node = root = data;

    var nodes = treemap.nodes(root); //.filter(function (d) { return !d.children; });
    nodes = nodes.filter(function (d) {
    	return !!d.name;
    });

    var cell = svg.selectAll('g')
    .data(nodes)
    .enter().append('svg:g')
    .attr('class', 'cell')
    .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    .on('click', function (d) { return zoom(node == d.parent ? root : d.parent); });

    cell.append('svg:rect')
    .attr('width', function (d) { return d.dx - 1; })
    .attr('height', function (d) { return d.dy - 1; })
    .style('fill', function (d) { 
    	return color(d.parent.name); 
    });

    cell.append('svg:text')
    .attr('x', function (d) { return d.dx / 2; })
    .attr('y', function (d) { return d.dy / 2; })
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .text(function (d) { return d.name; })
    .style('opacity', function (d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });

    d3.select(window).on('click', function () { zoom(root); });

    d3.select('select').on('change', function () {
    	var property = this.value;
    	var extractor = getMetric.bind(null, property);
    	treemap.value(extractor).nodes(root);

    	/*
    	if (this.value === 'loc') {
    		treemap.value(loc).nodes(root);
    	} else if (this.value === 'halstead') {
    		treemap.value(halstead).nodes(root);
    	} else if (this.value === 'cyclomatic') {
    		treemap.value(cyclomatic).nodes(root);
    	}
    	*/
      zoom(node);
    });
  }

  function getMetric(property, d) {
  	return d[property] ? d[property] : 1;
  }

  /*
  function loc(d) {
  	return d.loc ? d.loc : 1;
  }

  function halstead(d) {
  	return d.halstead ? d.halstead : 1;
  }

  function cyclomatic(d) {
  	return d.cyclomatic ? d.cyclomatic : 1;
  }
  */

  function zoom(d) {
    var kx = w / d.dx, ky = h / d.dy;
    x.domain([d.x, d.x + d.dx]);
    y.domain([d.y, d.y + d.dy]);

    var t = svg.selectAll('g.cell').transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .attr('transform', function(d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });

    t.select('rect')
    .attr('width', function(d) { return kx * d.dx - 1; })
    .attr('height', function(d) { return ky * d.dy - 1; })

    t.select('text')
    .attr('x', function(d) { return kx * d.dx / 2; })
    .attr('y', function(d) { return ky * d.dy / 2; })
    .style('opacity', function(d) { return kx * d.dx > d.w ? 1 : 0; });

    node = d;
    d3.event.stopPropagation();
  }

  loadData('risk.json', vizData);
}(d3));