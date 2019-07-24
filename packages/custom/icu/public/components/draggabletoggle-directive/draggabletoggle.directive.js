"use strict";
angular
  .module("mean.icu.ui.draggabletoggle", [])
  .directive("draggableToggle", function($document) {
    return {
      restrict: "A",
      scope: {
        dragOptions: "=draggableToggle"
      },
      link: function(scope, elem, attr) {
        var startX,
          startY,
          x = 0,
          y = 0,
          start,
          stop,
          drag,
          receive,
          container;

        var width = elem[0].offsetWidth,
          height = elem[0].offsetHeight;

        // Obtain drag options
        if (scope.dragOptions) {
          start = scope.dragOptions.start;
          drag = scope.dragOptions.drag;
          stop = scope.dragOptions.stop;
          receive = scope.dragOptions.receive;

          // var id = 'dragcontainer';
          // if (id) {
          //     container = document.getElementById(id).getBoundingClientRect();
          // }
        }

        // Bind mousedown event
        elem.on("mousedown", function(e) {
          if (elem.hasClass("selected")) {
            return;
          }
          e.preventDefault();

          startX = e.clientX - elem[0].offsetLeft;
          //        startY = e.clientY - elem[0].offsetTop;
          $document.on("mousemove", mousemove);
          $document.on("mouseup", mouseup);
          if (start) start(e);
        });

        // Handle drag event
        function mousemove(e) {
          y = e.clientY - startY;
          x = e.clientX - startX;
          setPosition(e);
          if (drag) drag(e);
        }

        // Unbind drag events
        function mouseup(e) {
          $document.unbind("mousemove", mousemove);
          $document.unbind("mouseup", mouseup);
          if (x >= 90) {
            elem.css({ left: 160 + "px" });
          }
          if (stop) stop(e);
        }

        var animate = function(pos) {
          setTimeout(function() {
            if (pos < 90 && pos > 0) {
              pos--;
              setTimeout(function() {
                elem.css({ left: pos + "px" });
              }, 25);
            }
          });
        };

        // Move element, within container if provided
        function setPosition(e) {
          if (x > 160) {
            // too far right
            x = 160;
          }
          if (x < 89) {
            x = 0;
          }
          if (x < 90) {
            animate(x);
            elem.css({
              //                    'background-color': 'yellow'
            });
            if (receive && !elem.hasClass("selected")) receive(e);
            elem.addClass("selected");
          }

          elem.css({
            top: y + "px",
            left: x + "px"
          });
        }
      }
    };
  });
