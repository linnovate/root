"use strict";
angular.module("mean.icu").directive("icuEventDrops", function() {
  function controller(
    $rootScope,
    $scope,
    EventDropsService,
    UsersService,
    $filter
  ) {
    var colors = d3.schemeCategory10;
    var FONT_SIZE = 12; // in pixels
    var TOOLTIP_WIDTH = 25; // in rem
    var eventDropsChart;
    UsersService.getMe().then(function(me) {
      $scope.me = me;
    });
    EventDropsService.getAll().then(function(data) {
      eventDropsChart = d3.chart
        .eventDrops()
        .start(new Date(new Date().getTime() - 3600000 * 24 * 7)) // one year ago
        .end(new Date())
        .eventLineColor((d, i) => colors[i])
        .date(function(d) {
          return new Date(d.created);
        })
        .mouseover(showTooltip)
        .mouseout(hideTooltip);
      d3.select("#chart_placeholder")
        .datum(data)
        .call(eventDropsChart);

      var oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      eventDropsChart.start(new Date(oneWeekAgo));
    });

    // we're gonna create a tooltip per drop to prevent from transition issues
    var showTooltip = action => {
      if (action.type === "update")
        action.text =
          action.text || $scope.me.name + " updated " + action.issue;
      else
        action.text =
          action.text ||
          $scope.me.name + " created " + action.title + " " + action.type;

      action.viewDate =
        action.viewDate || $filter("date")(action.date, "medium");

      d3.select("body")
        .selectAll(".tooltip")
        .remove();

      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0); // hide it by default

      var t = d3
        .transition()
        .duration(250)
        .ease(d3.easeLinear);

      tooltip
        .transition(t)
        .on("start", () => {
          d3.select(".tooltip").style("display", "block");
        })
        .style("opacity", 1);

      var rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;

      var direction = d3.event.pageX > rightOrLeftLimit ? "right" : "left";

      var ARROW_MARGIN = 1.65;
      var ARROW_WIDTH = FONT_SIZE;
      var left =
        direction === "right"
          ? d3.event.pageX - rightOrLeftLimit
          : d3.event.pageX - (ARROW_MARGIN * (FONT_SIZE - ARROW_WIDTH)) / 2;

      tooltip.html(`
                <div class="action" ng-if="action.type!==update">
                    <div class="tooltip-content">
                        <h3 class="message">${action.text}</h3>
                        <p>
                            on <span class="date">${action.viewDate}</span> 
                        </p>
                    </div>
                </div>`);

      tooltip
        .style("left", `${left}px`)
        .style("top", `${d3.event.pageY + 16}px`)
        .classed(direction, true);
    };
    var hideTooltip = () => {
      var t = d3.transition().duration(1000);

      d3.select(".tooltip")
        .transition(t)
        .on("end", function end() {
          this.remove();
        })
        .style("opacity", 0);
    };
    var numberactions = document.getElementById("numberactions");
    var zoomStart = document.getElementById("zoomStart");
    var zoomEnd = document.getElementById("zoomEnd");
  }

  return {
    restrict: "A",
    templateUrl: "/icu/components/event-drops/event-drops.html",
    controller: controller
  };
});
