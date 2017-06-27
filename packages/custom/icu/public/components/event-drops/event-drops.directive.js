'use strict';
angular.module('mean.icu')
    .directive('icuEventDrops', function () {
        function controller($rootScope, $scope, EventDropsService, UsersService) {
            var colors = d3.schemeCategory10;
            var FONT_SIZE = 12; // in pixels
            var TOOLTIP_WIDTH = 25; // in rem
            var eventDropsChart;
            UsersService.getMe().then(function (me) {
                $scope.me = me;
            });
            EventDropsService.getAll().then(function (data) {
                eventDropsChart = d3.chart.eventDrops()
                    .start(new Date(new Date().getTime() - (3600000 * 24 * 7))) // one year ago
                    .end(new Date())
                    .eventLineColor((d, i) => colors[i])
                    .date(d => new Date(d.created));
                    // .mouseover(showTooltip)
                    // .mouseout(hideTooltip);
                // .zoomend(renderStats);
                d3.select('#chart_placeholder')
                    .datum(data)
                    .call(eventDropsChart)

                var oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                eventDropsChart.start(new Date(oneWeekAgo));
            });

            // we're gonna create a tooltip per drop to prevent from transition issues
            var showTooltip = (action) => {
                d3.select('body').selectAll('.tooltip').remove();

                var tooltip = d3
                    .select('body')
                    .append('div')
                    .attr('class', 'tooltip')
                    //  .attr('id', 'tooltip')
                    .style('opacity', 0); // hide it by default

                var t = d3.transition().duration(250).ease(d3.easeLinear);

                tooltip
                    .transition(t)
                    .on('start', () => {
                        d3.select('.tooltip').style('display', 'block');
                    })
                    .style('opacity', 1);

                var rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;

                var direction = d3.event.pageX > rightOrLeftLimit ? 'right' : 'left';

                var ARROW_MARGIN = 1.65;
                var ARROW_WIDTH = FONT_SIZE;
                var left = direction === 'right'
                    ? d3.event.pageX - rightOrLeftLimit
                    : d3.event.pageX - ((ARROW_MARGIN * (FONT_SIZE - ARROW_WIDTH)) / 2);

                tooltip.html(`
                <div class="action">
                    <div class="content">
                        <h3 class="message">${$scope.me.name} '  ' ${action.type}' '${action.title | action.issue}</h3>
                        <p>
                            on <span class="date">${action.date}</span> -
                            <a class="sha" ${action.updated}</a>
                        </p>
                    </div>
                </div>`);
                tooltip
                    .style('left', `${left}px`)
                    .style('top', `${d3.event.pageY + 16}px`)
                    .classed(direction, true);
            };
            var hideTooltip = () => {
                var t = d3.transition().duration(1000);

                d3
                    .select('.tooltip')
                    .transition(t)
                    .on('end', function end() {
                        this.remove();
                    })
                    .style('opacity', 0);
            };
            var numberactions = document.getElementById('numberactions');
            var zoomStart = document.getElementById('zoomStart');
            var zoomEnd = document.getElementById('zoomEnd');

            // var renderStats = (data) => {
            //     var newScale = d3.event ? d3.event.transform.rescaleX(eventDropsChart.scales.x) : eventDropsChart.scales.x;
            //     var filteredactions = data.reduce((total, repository) => {
            //         var filteredRow = eventDropsChart.visibleDataInRow(repository.data, newScale);
            //         return total + filteredRow.length;
            //     }, 0);

            //     numberactions.textContent = +filteredactions;
            //     zoomStart.textContent = newScale.domain()[0].toLocaleDateString('en-US');
            //     zoomEnd.textContent = newScale.domain()[1].toLocaleDateString('en-US');
            // };

        }


        return {
            restrict: 'A',
            templateUrl: '/icu/components/event-drops/event-drops.html',
            controller: controller
        };
    });



