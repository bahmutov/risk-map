/*! risk-map-0.0.1 built on Tue Jul 30 2013 17:08:39 by Gleb Bahmutov */

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
    	.attr('transform', function (d) { 
    		return 'translate(' + d.x + ',' + d.y + ')'; 
    	})
    	.on('click', function (d) { 
    		return zoom(node == d.parent ? root : d.parent); 
    	});

    var colorCompute = d3.interpolateHsl('hsl(0, 100%, 50%)', 'hsl(0, 100%, 100%)');
    var coverageScale = d3.scale.linear()
    	.domain([0, 100])
    	.range([0, 1]);

    cell.append('svg:rect')
    	.attr('width', function (d) { return d.dx - 1; })
    	.attr('height', function (d) { return d.dy - 1; })
    	.style('fill', function (d) { 
    		// return color(d.parent.name); 
    		var cover = d.coverage ? +d.coverage : 0;
    		var unit = coverageScale(cover);
    		return colorCompute(unit);
    	});

    cell.append('svg:title')
    	.text(function (d) {
    		return d.name + '\n' + d.loc + ' lines of code\n'
    			+ d.cyclomatic + ' cyclomatic complexity\n'
    			+ d.halstead + ' Halstead difficulty\n'
    			+ d.coverage + '% unit test coverage';
    	});

    cell.append('svg:text')
    	.attr('x', function (d) { return d.dx / 2; })
    	.attr('y', function (d) { return d.dy / 2; })
    	.attr('dy', '.35em')
    	.attr('text-anchor', 'middle')
    	.text(function (d) { return d.name; })
    	.style('opacity', function (d) { 
    		d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; 
    	});

    d3.select(window).on('click', function () { zoom(root); });

    d3.select('select').on('change', function () {
    	var property = this.value;
    	var extractor = getMetric.bind(null, property);
    	treemap.value(extractor).nodes(root);
      zoom(node);
    });
  }

  function getMetric(property, d) {
  	return d[property] ? d[property] : 1;
  }

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