toolsUsed = function(_parentElement, _data){
    this.parentElement = _parentElement;
    data = _data;
    this.initVis();
}

toolsUsed.prototype.initVis = function(){

	var vis = this;	

	vis.margin = {top: 50, right:10, bottom: 100, left: 10},
      vis.width = 500 - vis.margin.left - vis.margin.right,
      vis.height = 500 - vis.margin.top - vis.margin.bottom;

  d3.select("#" + vis.parentElement).selectAll("*").
  remove();

  //allocate space for viz
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	vis.myScale = d3.scaleLinear()
  		.domain([0, 100])
  		.range([5, 120]);

	data.forEach(function(d){
		d.n_rotate_view = d.data.reduce(function (total, attempt){
											return total + attempt.n_rotate_view}, 0)
		d.num_attempts = d.data.length

	})

	var node = vis.svg.append("g")
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
			.attr("r", function(d){
						return vis.myScale(d.n_rotate_view / d.num_attempts)
					})
    		.attr("cx", vis.width / 2)
    		.attr("cy", vis.height / 2)
    		.style("fill", "#69b3a2")
    		.style("fill-opacity", 0.3)
    		.attr("stroke", "#69a2b2")
    		.style("stroke-width", 1)
    		.call(d3.drag() // call specific function when circle is dragged
           		.on("start", dragstarted)
           		.on("drag", dragged)
           		.on("end", dragended));

    var simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(vis.width / 2).y(vis.height / 2)) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(.2).radius(function(d){return vis.myScale(d.n_rotate_view / d.num_attempts)+3 }).iterations(1)) // Force that avoids circle overlapping

  	// Apply these forces to the nodes and update their positions.
  	// Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  	simulation
      .nodes(data)
      .on("tick", function(d){
        node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
      });

    function dragstarted(d) {
	    if (!d3.event.active) simulation.alphaTarget(.03).restart();
	    d.fx = d.x;
	    d.fy = d.y;
	}

	function dragged(d) {
	    d.fx = d3.event.x;
	    d.fy = d3.event.y;
	}

	function dragended(d) {
	    if (!d3.event.active) simulation.alphaTarget(.03);
	    d.fx = null;
	    d.fy = null;
	}
}
