//Global variables
var activeTime;
var toolsUsed;
var toolsUsedNew;
var failedAttempts;
var Data;
var tool;

function getTool(tool){
  tool = tool
  if (Data != null){
    toolsUsed = initToolsUsed(Data, tool)
  }
}

function initVis(data) {

  Data = data;
  console.log(data)

	//disable sort checkbox
	d3.select(".sort")             
	  .select("input")
	  .property("disabled", true)
	  .property("checked", false);

	//detail checkbox
	d3.select(".detail")
	  .select("input")
	  .property("checked", false);

  d3.select(".tools")
    .select("select")
    .property("onchange", getTool(this.value))

	activeTime = initActiveTime(data);
  toolsUsedNEW = initToolsUsed_NEW(data);
  toolsUsed = initToolsUsed(data, "rotate_view");
  failedAttempts = initFailedAttempts(data);
}

function initToolsUsed_NEW(data) {

  var margin = {top: 50, right:10, bottom: 100, left: 10},
    width = 400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  d3.select("#tools_used_NEW").selectAll("*").remove();

  //allocate space for viz
  var tools_used_NEW = d3.select("#tools_used_NEW");

  tools_used_NEW.svg = tools_used_NEW.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  data.forEach(function(d){
    d.n_rotate_view = d.data.reduce(function (total, attempt){
                      return total + attempt.n_rotate_view}, 0)

    d.n_snapshot = d.data.reduce(function (total, attempt){
                      return total + attempt.n_snapshot}, 0)

    d.n_submits = d.data.reduce(function (total, attempt){
                      return total + attempt.n_check_solution}, 0)

    d.active_time = d.data.reduce(function (total, attempt){
                      return total + attempt.active_time}, 0)

    d.num_attempts = d.data.length

    d.rotate_view = (d.n_rotate_view / d.num_attempts)
    d.snapshot = (d.n_snapshot / d.num_attempts)
    d.submits = (d.n_submits / d.num_attempts)

  })

  var r = d3.scaleLinear()
        .domain([0, 50])
        .range([0, 50]);

  var small_r = d3.scaleLinear()
      .domain([0, 20])
      .range([0, 50]);

  var x = d3.scaleLinear()
    .domain([20, 100])
    .range([ 0, width]);


  tools_used_NEW.svg.append("g")
    .attr("transform", "translate(0," + (height - 50) + ")")
    .call(d3.axisBottom(x));

  tools_used_NEW.svg.append("g")
    .attr("transform", "translate(0," + 50 + ")")
    .call(d3.axisBottom(x));

  tools_used_NEW.svg.append("g")
    .attr("transform", "translate(0," + (height / 2) + ")")
    .call(d3.axisBottom(x));

  tools_used_NEW.svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", (width / 2) + 50)
    .attr("y", height)
    .text("Composite Persistence score");

  tools_used_NEW.svg.append("text")
    .attr("class", "circle label")
    .attr("text-anchor", "end")
    .attr("x", 75)
    .attr("y", - 25)
    .text("Check solution");

  tools_used_NEW.svg.append("text")
    .attr("class", "circle label")
    .attr("text-anchor", "end")
    .attr("x", 50)
    .attr("y", (height / 2) - 75)
    .text("Snapshot");

  tools_used_NEW.svg.append("text")
    .attr("class", "circle label")
    .attr("text-anchor", "end")
    .attr("x", 50)
    .attr("y", height - 140)
    .text("Rotate View");

  var circle_clicked = false;

  var node = tools_used_NEW.svg.append("g")
    .selectAll("dot")
    .data(data)

  var elemEnter = node.enter()
    .append("g")

  tools_used_NEW.dot = elemEnter.append("circle")
      .attr("cx", function (d) {return x(d.data[d.data.length - 1].cum_avg_perc_composite); } )
      .attr("cy", 0)
      .attr("r", function (d) { return small_r(d.submits); } )
      .style("fill", "#00CC00")
      .style("opacity", ".7")
      .attr("stroke", "black")
      //grey out non-clicked
      .on("click", function(d){
        if (circle_clicked == false){
          highlightStudent(d);
          circle_clicked = true;
        } else {
            circle_clicked = false;
            unhighlightStudent(d);
          }
        });

  var node2 = tools_used_NEW.svg.append("g")
    .selectAll("dot")
    .data(data)

  var elemEnter2 = node2.enter()
    .append("g")

  tools_used_NEW.dot2 = elemEnter2.append("circle")
      .attr("cx", function (d) {return x(d.data[d.data.length - 1].cum_avg_perc_composite); } )
      .attr("cy", (height / 2) - 50)
      .attr("r", function (d) { return small_r(d.snapshot); } )
      .style("fill", "#00CC00")
      .style("opacity", ".7")
      .attr("stroke", "black")
      //grey out non-clicked
      .on("click", function(d){
        if (circle_clicked == false){
          highlightStudent(d);
          circle_clicked = true;
        } else {
            circle_clicked = false;
            unhighlightStudent(d);
          }
        });

  var node3 = tools_used_NEW.svg.append("g")
    .selectAll("circle")
    .data(data)

  var elemEnter3 = node3.enter()
    .append("g")

  tools_used_NEW.dot3 = elemEnter3.append("circle")
      .attr("cx", function (d) {return x(d.data[d.data.length - 1].cum_avg_perc_composite); } )
      .attr("cy", height - 100)
      .attr("r", function (d) { return r(d.rotate_view); } )
      .style("fill", "#00CC00")
      .style("opacity", ".7")
      .attr("stroke", "black")
      //grey out non-clicked
      .on("click", function(d){
        if (circle_clicked == false){
          highlightStudent(d);
          circle_clicked = true;
        } else {
            circle_clicked = false;
            unhighlightStudent(d);
          }
        });
  return tools_used_NEW
}

function initToolsUsed(data, tool) {

  if (tool == null) {
    tool = "rotate_view"
  }

  var margin = {top: 50, right:10, bottom: 100, left: 0},
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  d3.select("#tools_used").selectAll("*").remove();

  //allocate space for viz
  var tools_used = d3.select("#tools_used");

  tools_used.svg = tools_used.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  switch (tool){
    case "rotate_view": 
      tools_used.myScale = d3.scaleLinear()
        .domain([0, 50])
        .range([0, 50]);
      break;
    case "snapshot": 
      tools_used.myScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, 50]);
  }

  data.forEach(function(d){
    d.n_rotate_view = d.data.reduce(function (total, attempt){
                      return total + attempt.n_rotate_view}, 0)

    d.n_snapshot = d.data.reduce(function (total, attempt){
                      return total + attempt.n_snapshot}, 0)

    d.active_time = d.data.reduce(function (total, attempt){
                      return total + attempt.active_time}, 0)

    d.num_attempts = d.data.length

    d.rotate_view = (d.n_rotate_view / d.num_attempts)
    d.snapshot = (d.n_snapshot / d.num_attempts)

  })

  var class_avg = 60 * (data.reduce(function (total, user){
    return total + user[tool]}, 0) / data.length)

  var Tooltip = d3.select("#tools_used")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("height", "45px")
    .style("width", "220px")

  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
  }
  var mousemove = function(d) {
    var change = getPercentageChange(class_avg, (60 * d[tool]))
    Tooltip
      .html(d.user + " used the " + tool + " tool " + change.PC + "% " + change.sign + " than your average student")
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+50) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
  }

  var node = tools_used.svg.append("g")
    .selectAll("circle")
    .data(data)

  var elemEnter = node.enter()
    .append("g")

  var circle_clicked = false;

  tools_used.circle = elemEnter.append("circle")
      .attr("r", function(d){
            return tools_used.myScale(d[tool])
          })
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", function(d){
        switch(d.data[d.data.length - 1].persistenceAcrossAttempts){
          case "LESS_PERSISTANCE_THAN_NORMAL": return "#33FF33"
          case "NORMAL_PERSISTANCE": return "#00CC00"
          case "MORE_PERSISTANCE_THAN_NORMAL": return "#006600"
        }
      })
      .style("fill-opacity", .7)
      .call(d3.drag() // call specific function when circle is dragged
             .on("start", dragstarted)
             .on("drag", dragged)
             .on("end", dragended))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

      //grey out non-clicked
      .on("click", function(d){
        if (circle_clicked == false){
          highlightStudent(d);
          circle_clicked = true;
        } else {
            circle_clicked = false;
            unhighlightStudent(d);
          }
        });

  var text = elemEnter.append("text")
      .attr("dx", function(d){return 100})
      .text(function(d){return d.user})

  var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(function(d){return tools_used.myScale(d[tool]) + 5}).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
      .nodes(data)
      .on("tick", function(d){
        tools_used.circle
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
        text
          .attr("dx", function(d){ return d.x - 10; })
          .attr("dy", function(d){ return d.y; })
          .attr("font-size", "8px")
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

  function getPercentageChange(avg, student){
    var sign;
    var decreaseValue = avg - student;
    var percentChange = (decreaseValue / ((avg + student) / 2)) * 100;

    if (Math.sign(percentChange) == 1)
      sign = "less"
    else
      sign = "more"

    return {PC: (Math.round(Math.abs(percentChange))), sign: sign} ;
  }

  return tools_used;
}

function initActiveTime(data) {

  var active_link = "0"; //to control legend selections and hover
  var legendClicked; //to control legend selections
  var legendClassArray = []; //store legend classes to select bars in plotSingle()
  var legendClassArray_orig = []; //orig (with spaces)
  var sortDescending; //if true, bars are sorted by height in descending order
  var restoreXFlag = false; //restore order of bars back to original

	var margin = {top: 10, right:10, bottom: 50, left: 50},
      width = 400 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    d3.select("#active_time").selectAll("*").remove();

	   //allocate space for viz
  var active_time = d3.select("#active_time")

    active_time.svg = active_time.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  d3.select(".detail").on("change", changeVis)

  function changeVis() {
    
    activeTime = initActiveTime(data);

  } 

  //add patterns for detail vis
  active_time = addPatterns(active_time);

  var info = getVisInfo();

  //create bar chart data
  data.forEach(function(d) {
    var user = d.user; //add to stock code
    var y0 = 0;
    d.time = info.color.domain().map(function(name) {
      var value = d[name]
      switch (name) {
        case "AT_1":
          value = d["AT_1_P"] + d["AT_1_F"]
          break;
        case "AT_2":
          value = d["AT_2_P"] + d["AT_2_F"]
          break;
        case "AT_3":
          value = d["AT_3_P"] + d["AT_3_F"]
          break;
      }
      return { 
        user:user, 
        name: name, 
        y0: y0, 
        y1: y0 += +value, 
        value: value,
        total: d.active_time
      }; 
      });
    d.total = d.time[d.time.length - 1].y1;
    });  

  //set x and y ranges
  var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(.15)
  // vis.x = d3.scaleOrdinal()
  //   .rangeRoundBands([0, vis.width], .2);

  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  //set x and y domains
  data.sort(function(a, b) {return -a.total + b.total;});
  x.domain(data.map(function(d){ return d.user; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice()

  //set x and y axis
    var xAxis = d3.axisBottom(x).tickFormat(function(d){ return d;});
    var yAxis = d3.axisLeft(y);

  //Draw x and y-axis
  active_time.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")  
          .attr("dx", "-1.5em")
          .attr("dy", "0em")
        .attr("transform", "rotate(-65)")

  active_time.svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,0)")
      .call(yAxis);

  var bar_clicked = false;

  //create g for each user column (instead of specific time chunk)
  active_time.user = active_time.svg.selectAll(".user")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("id", function(d){ return d.user})
      .attr("transform", function(d) { return "translate(" + "0" + ",0)"; })
      
      //grey out non-clicked
      .on("click", function(d){
        if (bar_clicked == false){
          highlightStudent(d);

          bar_clicked = true;
        } else {
            unhighlightStudent(d);
            bar_clicked = false;
          }
      });

  // create a tooltip
  var Tooltip = d3.select("#active_time")
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
    d3.select(this)
      .style("stroke", "black")
  }
  var mousemove = function(d) {
    Tooltip
      .html(d.user + " spent "  + (100 * (d.value / d.total)).toFixed(1) + "% of their time <br>" + vartoText(d.name) + " puzzles.")
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY) - 100 + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
  }

  function vartoText(d) {
    
    switch(d){
      case "AT_1": return "on easy"
      case "AT_2": return "on medium"
      case "AT_3": return "on hard"
      case "AT_1_P": return "completing easy"
      case "AT_2_P": return "completing medium"
      case "AT_3_P": return "completing hard"
      case "AT_1_F": return "on unfinished easy"
      case "AT_2_F": return "on unfinished medium"
      case "AT_3_F": return "on unfinished hard"
    }
  }

  //Draw Stacked Chart
  active_time.user.selectAll("rect")
    .data(function(d) {
      return d.time; 
    })
    .enter().append("rect")
      .attr("width", x.bandwidth())
      .attr("y", function(d) {
        return y(d.y1);})
      .attr("x",function(d) {return x(d.user);})
      .attr("height", function(d) {return y(0) - y(d.value);})
      .attr("class", function(d) {        
        classLabel = d.name.replace(/\s/g, ''); //remove spaces
        return "bars class" + classLabel;
      })
      .style("fill", function(d) { return info.color(d.name); })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);


  //LEGEND
  var legend = active_time.svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data((info.keys).reverse())
    .enter().append("g")
      .attr("class", function (d) {
        legendClassArray.push(d);
        legendClassArray_orig.push(d);
        return "legend";
      })
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legendClassArray = legendClassArray.reverse();
  legendClassArray_orig = legendClassArray_orig.reverse();

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", info.color)
      .attr("id", function (d, i) {
        return "id" + d;
      })
      .on("mouseover",function(){        

        if (active_link === "0") d3.select(this).style("cursor", "pointer");
        else {
          if (active_link.split("class").pop() === this.id.split("id").pop()) {
            d3.select(this).style("cursor", "pointer");
          } else d3.select(this).style("cursor", "auto");
        }
      })

      .on("click",function(d){        

        if (active_link === "0") { //nothing selected, turn on this selection
          d3.select(this)           
            .style("stroke", "black")
            .style("stroke-width", 2);

            active_link = this.id.split("id").pop();
            plotSingle(this);

            //gray out the others
            for (i = 0; i < legendClassArray.length; i++) {
              if (legendClassArray[i] != active_link) {
                d3.select("#id" + legendClassArray[i])
                  .style("opacity", 0.5);
              } else sortBy = i; //save index for sorting in change()
            }

            //enable sort checkbox
            d3.select(".sort").select("input").property("disabled", false)
            d3.select(".sort").style("color", "black")

            //sort the bars if checkbox is clicked            
            d3.select(".sort").select("input").on("change", changeSort);  
           
        } else { //deactivate
          if (active_link === this.id.split("id").pop()) {//active square selected; turn it OFF
            d3.select(this)           
              .style("stroke", "none");
            
            //restore remaining boxes to normal opacity
            for (i = 0; i < legendClassArray.length; i++) {              
                d3.select("#id" + legendClassArray[i])
                  .style("opacity", 1);
            }

            
            if (d3.select(".sort").select("input").property("checked")) {              
              restoreXFlag = true;
            }
            
            //disable sort checkbox
            d3.select(".sort")
              .style("color", "#D8D8D8")
              .select("input")
              .property("disabled", true)
              .property("checked", false);   

            //sort bars back to original positions if necessary
            changeSort();            

            //y translate selected category bars back to original y posn
            restorePlot(d);

            active_link = "0"; //reset
          }

        } });

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) {
        switch(d) {
          case "AT_1": return "Easy"
          case "AT_2": return "Medium"
          case "AT_3": return "Hard"
          case "AT_1_P": return "Easy"
          case "AT_2_P": return "Medium"
          case "AT_3_P": return "Hard"
          case "AT_1_F": return "Easy (unsuccessful)"
          case "AT_2_F": return "Medium (unsuccessful)"
          case "AT_3_F": return "Hard (unsuccessful)"
        }});

  function restorePlot(d) {

    //translate bars back up to original y-posn
    active_time.user.selectAll("rect")
      .attr("x", function(d) {
        return x(d.user); })
      .transition()
      .duration(1000)
      .delay(function () {
        if (restoreXFlag) return 2000; //bars have to be restored to orig posn
        else return 0;
      })
      .attr("y", function(d) {return y(d.y1); });

    //reset
    restoreXFlag = false;  
  }

  function plotSingle(d) {
        
    class_keep = d.id.split("id").pop();
    idx = legendClassArray.indexOf(class_keep);

    //shift positioning of the bars  
    active_time.user.nodes().forEach(function (d, i) {

      var nodes = d.childNodes;
  
      //get height and y posn of base bar and selected bar
      h_keep = d3.select(nodes[idx]).attr("height");
      y_keep = d3.select(nodes[idx]).attr("y"); 

      h_base = d3.select(nodes[0]).attr("height");
      y_base = d3.select(nodes[0]).attr("y");   

      h_shift = h_keep - h_base;
      y_new = y_base - h_shift;

      //reposition selected bars
      d3.select(nodes[idx])
        .transition()
        // .ease("bounce")
        .duration(750)
        .delay(750)
        .attr("y", y_new);

      for (var i = 0; i <= nodes.length - 1; i++) {
        
        //shift bars up if below the selected bar
        if (i < idx){

          y_curr = d3.select(nodes[i]).attr("y")

          d3.select(nodes[i])
          .transition()
          // .ease("bounce")
          .duration(750)
          .delay(750)
          .attr("y", y_curr - h_keep);
        }
      }
    }); 
  }

  function changeSort() {
    if (this.checked) sortDescending = true;
    else sortDescending = false;

    colName = legendClassArray_orig[sortBy];

    var x0 = x.domain(data.sort(sortDescending
        ? function(a, b) { 

          var value = b[colName] - a[colName]
          switch (colName) {
            case "AT_1":
              value = (b["AT_1_P"] + b["AT_1_F"]) - (a["AT_1_P"] + a["AT_1_F"])
              break;
            case "AT_2":
              value = (b["AT_2_P"] + b["AT_2_F"]) - (a["AT_2_P"] + a["AT_2_F"])
              break;
            case "AT_3":
              value = (b["AT_3_P"] + b["AT_3_F"]) - (a["AT_3_P"] + a["AT_3_F"])
              break;
          }

          return value; }
        : function(a, b) { return b.total - a.total; })
        .map(function(d,i) { return d.user; }))
        .copy();

    active_time.user.selectAll("rect")
         .sort(function(a, b) { 
            return x0(a.user) - x0(b.user); 
          });

    var transition = active_time.transition().duration(750),
        delay = function(d, i) { return i * 20; };

    active_time.user.selectAll("rect")
      .transition()
      .duration(750)
      .attr("x", function(d) {      
        return x0(d.user); 
      });     

    //sort x-labels accordingly    
    transition.select(".x.axis")
        .call(xAxis)
        .selectAll("g")
        .delay(delay);
  }
  return active_time;
}

function initFailedAttempts(data) {

  var margin = {top: 50, right:10, bottom: 100, left: 30},
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  d3.select("#failed_attempts").selectAll("*").remove();

  //allocate space for viz
  var failed_attempts = d3.select("#failed_attempts");

  failed_attempts.svg = failed_attempts.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    var max_failed = d3.max(data, function(d) { return d.num_failed; })

    var x = d3.scaleLinear()
    .domain([0, max_failed + 3])
    .range([ 0, width]);
    failed_attempts.svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
    .domain([0, max_failed + 3])
    .range([ height, 0]);
    failed_attempts.svg.append("g")
    .call(d3.axisLeft(y));

    var line = d3.line()
    var points = [[x(0), y(0)], [x(max_failed + 3), y(max_failed + 3)]]
    var pathData = line(points);
    failed_attempts.svg.append('path')
      .attr('d', pathData)
      .attr('stroke', "black")
      .attr('opacity', ".3")

    var Tooltip = d3.select("#failed_attempts")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("height", "45px")
      .style("width", "180px")

    var mouseover = function(d) {
      Tooltip
        .style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
    }
    var mousemove = function(d) {
      var ratio = Math.round((d.reattempts_AF / d.num_failed) * 100)

      if (d.num_failed == 0){
        Tooltip
        .html(d.user + " did not fail any puzzles")
        .style("left", (d3.mouse(this)[0]+ "px"))
        .style("top", (d3.mouse(this)[1] + "px"))
      }
      else{
        Tooltip
        .html(d.user + " reattempted " + ratio + "% of the puzzles they failed")
        .style("left", (d3.mouse(this)[0]+ "px"))
        .style("top", (d3.mouse(this)[1] + "px"))
      }
      
    }
    var mouseleave = function(d) {
      Tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
    }

    var node = failed_attempts.svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()


    var circle_clicked = false;

    failed_attempts.circle = node.append("circle")
      .attr("cx", function (d) { return x(d.num_failed); } )
      .attr("cy", function (d) { return y(d.reattempts_AF); } )
      .attr("r", function(d){ 
        if (d.num_failed == 0) {
          return 8
        }
        return 8 * (d.reattempts_AF / d.num_failed);})
      .style("fill", "orange")
      //grey out non-clicked
      .on("click", function(d){
        if (circle_clicked == false){
          highlightStudent(d);
          circle_clicked = true;
        } else {
            circle_clicked = false;
            unhighlightStudent(d);
          }
        })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    failed_attempts.svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", (width / 2) + 50)
    .attr("y", height + 50)
    .text("Total failed puzzles");

  return failed_attempts;

}

function addPatterns(vis) {

  //Append patterns for successful/unsuccessful active time
  vis.svg.append('defs')
  .append('pattern')
    .attr('id', 'diagonalHatchE')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 4)
    .attr('height', 4)
  .append('path')
    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
    .attr('stroke', '#3F8FD2')
    .attr('stroke-width', 1);

  vis.svg.append('defs')
  .append('pattern')
    .attr('id', 'diagonalHatchM')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 4)
    .attr('height', 4)
  .append('path')
    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
    .attr('stroke', '#FFC000')
    .attr('stroke-width', 1);

  vis.svg.append('defs')
  .append('pattern')
    .attr('id', 'diagonalHatchH')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 4)
    .attr('height', 4)
  .append('path')
    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
    .attr('stroke', '#FF4C00')
    .attr('stroke-width', 1);

    return vis;
}

function getVisInfo() {
  var keys;
  var color = d3.scaleOrdinal();

  if (d3.select(".detail").select("input").property("checked")){
    detail = true;
    keys = ["AT_1_P", "AT_2_P", "AT_3_P", "AT_1_F", "AT_2_F", "AT_3_F"]
    color.domain(keys)
    color.range(["#3F8FD2", "#FFC000", "#FF4C00", 'url(#diagonalHatchE)', 'url(#diagonalHatchM)', 'url(#diagonalHatchH)'])}
    // color.range(["#3F8FD2", "#3F8FD2", "#FFC000", "#FFC000", "#FF4C00", "#FF4C00"])}
  else {
    detail = false;
    keys = ["AT_1", "AT_2", "AT_3"]
    color.domain(keys)
    color.range(["#3F8FD2", "#FFC000", "#FF4C00"])}

  return {detail: detail, keys: keys, color: color};
}

function highlightStudent(d) {

  document.getElementById("student_highlight").innerHTML = "Student selected:" + d.user
  
  //highlight in reattempts viz

  var reattempt_circle_array = failedAttempts.circle._groups[0];
  
  for (var i = reattempt_circle_array.length - 1; i >= 0; i--) {
    if (reattempt_circle_array[i].__data__ != d) {
      d3.select(reattempt_circle_array[i])
        .style("opacity", .1)
    }
  }

  //highlight in tools used NEW
  var dot_array = toolsUsedNEW.dot._groups[0];
  var tool1;
  var tool2;
  var tool3;

  for (var i = dot_array.length - 1; i >= 0; i--) {
    if (dot_array[i].__data__ != d) {
      d3.select(dot_array[i])
        .style("opacity", .05)
    } else {
      tool1 = dot_array[i]
      d3.select(dot_array[i])
        .style("opacity", 1)
    }
  }

  toolsUsedNEW.svg.append("text")
    .attr("class", "tool_highlight label")
    .attr("text-anchor", "end")
    .attr("x", 250)
    .attr("y", -10)
    .html(tool1.__data__.user + " checked their solution " + Math.round(tool1.__data__.submits) + " times per puzzle");

  var dot2_array = toolsUsedNEW.dot2._groups[0];

  for (var i = dot2_array.length - 1; i >= 0; i--) {
    if (dot2_array[i].__data__ != d) {
      d3.select(dot2_array[i])
        .style("opacity", .05)
    } else {
      tool2 = dot2_array[i]
      d3.select(dot2_array[i])
        .style("opacity", 1)
    }
  }

  toolsUsedNEW.svg.append("text")
    .attr("class", "tool_highlight label")
    .attr("text-anchor", "end")
    .attr("x", 175)
    .attr("y", 120)
    .html(tool2.__data__.user + " took " + Math.round(tool2.__data__.snapshot) + " snapshots per puzzle");


  var dot3_array = toolsUsedNEW.dot3._groups[0];

  for (var i = dot3_array.length - 1; i >= 0; i--) {
    if (dot3_array[i].__data__ != d) {
      d3.select(dot3_array[i])
        .style("opacity", .05)
    } else {
      tool3 = dot3_array[i]
      d3.select(dot3_array[i])
        .style("opacity", 1)
    }
  }

  toolsUsedNEW.svg.append("text")
    .attr("class", "tool_highlight label")
    .attr("text-anchor", "end")
    .attr("x", 235)
    .attr("y", 225)
    .html(tool3.__data__.user + " used the rotate view tool " + Math.round(tool3.__data__.rotate_view) + " times per puzzle");

  //highlight in circles
  var circle_array = toolsUsed.circle._groups[0];

  for (var i = circle_array.length - 1; i >= 0; i--) {
    if (circle_array[i].__data__ != d) {
      d3.select(circle_array[i])
        .style("opacity", .1)
    }
  }

  //highlight in bar chart
  var bar_array = activeTime.user._groups[0];

  for (var i = bar_array.length - 1; i >= 0; i--) {
    if (bar_array[i].__data__ != d) {
      d3.select(bar_array[i])
        .style("opacity", .1)
    }
  }
}

function unhighlightStudent(d) {

  document.getElementById("student_highlight").innerHTML = "Student selected:<br>"
  d3.select("#tools_used_NEW").selectAll(".tool_highlight").remove();

  var reattempt_circle_array = failedAttempts.circle._groups[0];
  
  for (var i = reattempt_circle_array.length - 1; i >= 0; i--) {
      d3.select(reattempt_circle_array[i])
        .style("opacity", 1)
  }

  var dot_array = toolsUsedNEW.dot._groups[0];
  var dot2_array = toolsUsedNEW.dot2._groups[0];
  var dot3_array = toolsUsedNEW.dot3._groups[0];

  for (var i = dot_array.length - 1; i >= 0; i--) {
      d3.select(dot_array[i])
        .style("opacity", .7)
  }

  for (var i = dot2_array.length - 1; i >= 0; i--) {
      d3.select(dot2_array[i])
        .style("opacity", .7)
  }

  for (var i = dot3_array.length - 1; i >= 0; i--) {
      d3.select(dot3_array[i])
        .style("opacity", .7)
  }

  var circle_array = toolsUsed.circle._groups[0];

  for (var i = circle_array.length - 1; i >= 0; i--) {
    d3.select(circle_array[i])
      .style("opacity", 1)
  }

  var bar_array = activeTime.user._groups[0];

  for (var i = bar_array.length - 1; i >= 0; i--) {
    d3.select(bar_array[i])
      .style("opacity", 1)
  }
}