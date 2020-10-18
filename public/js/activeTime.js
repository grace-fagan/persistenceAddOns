var data;

var active_link = "0"; //to control legend selections and hover
var legendClicked; //to control legend selections
var legendClassArray = []; //store legend classes to select bars in plotSingle()
var legendClassArray_orig = []; //orig (with spaces)
var sortDescending; //if true, bars are sorted by height in descending order
var restoreXFlag = false; //restore order of bars back to original

//disable sort checkbox
d3.select(".sort")             
  .select("input")
  .property("disabled", true)
  .property("checked", false);

//detail checkbox
d3.select(".detail")
  .select("input")
  .property("checked", false);

activeTime = function(_parentElement, _data){
    this.parentElement = _parentElement;
    data = _data;
    var vis = this;
    vis.initVis();
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

activeTime.prototype.initVis = function(){

  var vis = this;

  vis.margin = {top: 10, right:10, bottom: 50, left: 50},
      vis.width = 600 - vis.margin.left - vis.margin.right,
      vis.height = 400 - vis.margin.top - vis.margin.bottom;

  d3.select("#" + vis.parentElement).selectAll("*").remove();

  //allocate space for viz
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  d3.select(".detail").on("change", changeVis)

  //add patterns for detail vis
  vis = addPatterns(vis);

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
  vis.x = d3.scaleBand()
    .rangeRound([0, vis.width])
    .padding(.15)
  // vis.x = d3.scaleOrdinal()
  //   .rangeRoundBands([0, vis.width], .2);

  vis.y = d3.scaleLinear()
    .rangeRound([vis.height, 0]);

  //set x and y domains
  data.sort(function(a, b) {return -a.total + b.total;});
  vis.x.domain(data.map(function(d){ return d.user; }));
  vis.y.domain([0, d3.max(data, function(d) { return d.total; })]).nice()

  //set x and y axis
    vis.xAxis = d3.axisBottom(vis.x).tickFormat(function(d){ return d;});
    vis.yAxis = d3.axisLeft(vis.y);

  //Draw x and y-axis
  vis.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(vis.xAxis)
      .selectAll("text")  
          .attr("dx", "-1.5em")
          .attr("dy", "0em")
        .attr("transform", "rotate(-65)")

  vis.svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,0)")
      .call(vis.yAxis);

  var bar_clicked = false;

  //create g for each user column (instead of specific time chunk)
  var user = vis.svg.selectAll(".user")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("id", function(d){ return d.user})
      .attr("transform", function(d) { return "translate(" + "0" + ",0)"; })
      
      //grey out non-clicked
      .on("click", function(d){
        if (bar_clicked == false){
          bar_clicked = true;
          for (var i = user._groups[0].length - 1; i >= 0; i--) {
            if (user._groups[0][i] != this) {
              d3.select(user._groups[0][i])
                .style("opacity", .2)
            }
          }
        } else {
            bar_clicked = false
            for (var i = user._groups[0].length - 1; i >= 0; i--) {
                d3.select(user._groups[0][i])
                  .style("opacity", 1)
              }
            }
        });

  // create a tooltip
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
    d3.select(this)
      .style("stroke", "black")
  }
  var mousemove = function(d) {
    Tooltip
      .html(d.user + " spent "  + (100 * (d.value / d.total)).toFixed(1) + "% of their time <br>" + vartoText(d.name) + " puzzles.")
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY) + "px")
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
  user.selectAll("rect")
    .data(function(d) {
      return d.time; 
    })
    .enter().append("rect")
      .attr("width", vis.x.bandwidth())
      .attr("y", function(d) {
        return vis.y(d.y1);})
      .attr("x",function(d) {return vis.x(d.user);})
      .attr("height", function(d) {return vis.y(0) - vis.y(d.value);})
      .attr("class", function(d) {        
        classLabel = d.name.replace(/\s/g, ''); //remove spaces
        return "bars class" + classLabel;
      })
      .style("fill", function(d) { return info.color(d.name); })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);


  //LEGEND
  var legend = vis.svg.append("g")
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
      .attr("x", vis.width - 19)
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
      .attr("x", vis.width - 24)
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
    user.selectAll("rect")
      .attr("x", function(d) {
        return vis.x(d.user); })
      .transition()
      .duration(1000)
      .delay(function () {
        if (restoreXFlag) return 2000; //bars have to be restored to orig posn
        else return 0;
      })
      .attr("y", function(d) {return vis.y(d.y1); });

    //reset
    restoreXFlag = false;  
  }

  function plotSingle(d) {
        
    class_keep = d.id.split("id").pop();
    idx = legendClassArray.indexOf(class_keep);

    //shift positioning of the bars  
    user.nodes().forEach(function (d, i) {

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

    var x0 = vis.x.domain(data.sort(sortDescending
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

    user.selectAll("rect")
         .sort(function(a, b) { 
            return x0(a.user) - x0(b.user); 
          });

    var transition = vis.svg.transition().duration(750),
        delay = function(d, i) { return i * 20; };

    user.selectAll("rect")
      .transition()
      .duration(750)
      .attr("x", function(d) {      
        return x0(d.user); 
      });     

    //sort x-labels accordingly    
    transition.select(".x.axis")
        .call(vis.xAxis)
        .selectAll("g")
        .delay(delay);   
  }

  function changeVis() {
    vis.initVis()
  }
}

