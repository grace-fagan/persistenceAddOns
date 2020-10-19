snapshotUsed = function(_parentElement, _data){
    this.parentElement = _parentElement;
    data = _data;
    this.initVis();
}

snapshotUsed.prototype.initVis = function(){

	var vis = this;	

	vis.margin = {top: 0, right:10, bottom: 50, left: 10},
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
  		.domain([0, .1])
  		.range([5, 90]);

	data.forEach(function(d){
		d.n_rotate_view = d.data.reduce(function (total, attempt){
											return total + attempt.n_rotate_view}, 0)

    d.n_snapshot = d.data.reduce(function (total, attempt){
                      return total + attempt.n_snapshot}, 0)

    d.active_time = d.data.reduce(function (total, attempt){
                      return total + attempt.active_time}, 0)

		d.num_attempts = d.data.length

    d.rotate = (d.n_rotate_view / d.active_time)
    d.snapshot = (d.n_snapshot / d.active_time)

	})

  var Tooltip = d3.select("#" + this.parentElement)
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("height", "45px")
    .style("width", "200px")

  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
    console.log(this)
    d3.select(this)
      .style("stroke", "black")
  }
  var mousemove = function(d) {
    console.log(d)
    Tooltip
      .html(d.user + " used the")
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
  }

	var node = vis.svg.append("g")
		.selectAll("circle")
		.data(data)

  var elemEnter = node.enter()
    .append("g")

  var circle = elemEnter.append("circle")
			.attr("r", function(d){
						return vis.myScale(d.snapshot)
					})
  		.attr("cx", vis.width / 2)
  		.attr("cy", vis.height / 2)
  		.style("fill", "orange")
  		.style("fill-opacity", .7)
  		// .call(d3.drag() // call specific function when circle is dragged
    //      		.on("start", dragstarted)
    //      		.on("drag", dragged)
    //      		.on("end", dragended))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

  var text = elemEnter.append("text")
      .attr("dx", function(d){return 100})
      .text(function(d){return d.user})

  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(vis.width / 2).y(vis.height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function(d){return vis.myScale(d.snapshot) + 3}).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  	simulation
      .nodes(data)
      .on("tick", function(d){
        circle
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
        text
          .attr("dx", function(d){ return d.x - 10; })
          .attr("dy", function(d){ return d.y; })
          .attr("font-size", "11px")
      });

 //    function dragstarted(d) {
	//     if (!d3.event.active) simulation.alphaTarget(.03).restart();
	//     d.fx = d.x;
	//     d.fy = d.y;
	// }

	// function dragged(d) {
	//     d.fx = d3.event.x;
	//     d.fy = d3.event.y;
	// }

	// function dragended(d) {
	//     if (!d3.event.active) simulation.alphaTarget(.03);
	//     d.fx = null;
	//     d.fy = null;
	// }
}
