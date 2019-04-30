(function() {
  var url =
    "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

  //our JavaScript section starts and the first thing that happens is that we set the size of the area that we’re going to use for the chart and the margins;
  var margin = { top: 60, left: 60, bottom: 60, right: 90 };
  var height = 480,
    width = 780;
  //format the time with minutes and seconds
  var ft = d3.time.format("%M:%S");

  //The next section declares the functions linear and scale
  var y = d3.scale.linear().range([0, height]);
  var x = d3.time.scale().range([0, width]);

  //The declarations for our two axes are relatively simple
  //show data (nums) under the x-axis line
  var xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.seconds, 30)
    .tickFormat(ft);
  //show data (nums) left of the y-axis line
  var yAxis = d3.svg
    .axis()
    .scale(y)
    .orient("left");

  /*
   * The next block of code selects the id scatterplot-stats on the web page
   * and appends an svg object to it of the size
   * that we have set up with our width, height and margin’s.
   */
  var svg = d3
    .select("#scatterplot-stats")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right);

  svg
    .append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "grey")
    .attr("fill-opacity", 0.8);
  // It also adds a g element that provides a reference point for adding our axes.
  svg = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //declair the tooltip
  var tooltip = d3
    .select("#scatterplot-stats")
    .append("div")
    .attr("class", "tooltip");

  /*
   * If doping allegiance make the circle red else make it orange
   */
  function doping(arg) {
    return arg !== "" ? "#314" : "skyblue";
  }

  /*
   * this function is like mouse over.
   * If we place the mouse over a circle the tooltip is going to show up.
   */
  function showToolTip(d, i) {
    tooltip.style({
      height: "150px",
      width: "200px",
      opacity: 0.9
    });
    var circle = d3.event.target;
    var tippadding = 5,
      tipsize = {
        dx: parseInt(tooltip.style("width")),
        dy: parseInt(tooltip.style("height"))
      };

    tooltip
      .style({
        top: d3.event.pageY - tipsize.dy - 5 + "px",
        left: d3.event.pageX - tipsize.dx - 5 + "px"
      })
      .html(
        "<span><b>" +
          d.Name +
          ": " +
          d.Nationality +
          "<br/>" +
          "Place: " +
          d.Place +
          " | Time: " +
          d.Time +
          "<br/>" +
          "Year: " +
          d.Year +
          "<br/><br/>" +
          "Doping: " +
          d.Doping +
          "</b></span>"
      );
  }

  /*
   * This function is like mouse out.
   * If we mouse out then the tooltip is hidding
   */
  function hideToolTip(d, i) {
    tooltip
      .style({
        height: 0,
        width: 0,
        opacity: 0
      })
      .html("");
  }

  /*
   * This function is like click.
   * If we click in the circle we are transfering to another site
   */
  function openEntry(d) {
    if (d.URL) {
      var win = window.open(d.URL, "_blank");
      win.focus();
    }
  }

  /*
   * d3.json takes the variable url and two more parameters
   * if error, then throw it
   * else map the time-date in the horizontal axis and the rank-position in the verticall axis
   */
  d3.json(url, (error, data) => {
    if (error) {
      throw new Error("d3.json error");
    } else {
      var fastest = d3.min(
        data.map(item => {
          return ft.parse(item.Time);
        })
      );
      var slowest = d3.max(
        data.map(item => {
          return ft.parse(item.Time);
        })
      );

      x.domain([slowest, fastest]);
      y.domain([
        1,
        d3.max(data, d => {
          return d.Place;
        }) + 1
      ]);
      //Add a "g" element that provides a reference point for adding our axes.
      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text") //add text to the axis
        .attr("transform", "translate(" + width + ",-30)")
        .attr("dy", "1.8em")
        .attr("text-anchor", "end")
        .text("Race time for 13.8km");

      svg
        .append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text") //add text to the axis
        .attr("transform", "rotate(-90)")
        .attr("dy", "-0.8em")
        .attr("text-anchor", "end")
        .text("Rank");

      /*
       * we add the cyclists to our scatterplot
       * This block of code creates the cyclists (selectAll(".cyclist"))
       * and associates each of them with a data set (.data(data)).
       * We then append a circle
       * with values for x/y position and height/width as configured in our earlier code.
       * we parse the time and the place
       */

      var cyclist = svg
        .selectAll(".cyclist")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "cyclist")
        .attr("x", d => {
          return x(ft.parse(d.Time));
        })
        .attr("y", d => {
          return y(d.Place);
        });

      cyclist
        .append("circle")
        .attr("cx", d => {
          return x(ft.parse(d.Time));
        })
        .attr("cy", d => {
          return y(d.Place);
        })
        .attr("r", 5)
        .attr("fill", d => {
          return doping(d.Doping);
        })
        //call the functions
        .on("mouseover", showToolTip)
        .on("mouseout", hideToolTip)
        .on("click", openEntry);

      //append the text and fix the distance btw the circles and the names
      cyclist
        .append("text")
        .attr("x", d => {
          return x(ft.parse(d.Time)) + 7;
        })
        .attr("y", d => {
          return y(d.Place) + 5;
        })
        .text(d => {
          return d.Name;
        });

      //right-bottom explainatory text
      var isDoped = svg
        .append("g")
        .attr(
          "transform",
          "translate(" + (width - 150) + "," + (height - 100) + ")"
        )
        .append("text")
        .attr("x", 10)
        .attr("y", 5)
        .attr("fill", "#314")
        .text("* Doping allegiance");
      var isNotDoped = svg
        .append("g")
        .attr(
          "transform",
          "translate(" + (width - 150) + "," + (height - 80) + ")"
        )
        .append("text")
        .attr("x", 10)
        .attr("y", 5)
        .attr("fill", "skyblue")
        .text("* No doping allegiance");
    } //end of else
  });
})();
