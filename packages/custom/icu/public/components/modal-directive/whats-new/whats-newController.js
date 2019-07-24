function controllerwhatsNew($scope, $uibModalInstance, $filter, $location) {
  $(document).ready(function() {
    $scope.whatsNew = window.config.whatsNew;
    var str =
      '<li data-target="#myCarousel" data-slide-to="0"><hr class="carousel-progress-bar" /></li>';
    $(".whatsNewList").append(str);
    Object.keys($scope.whatsNew).forEach(function(wn) {
      var str =
        '<li data-target="#myCarousel" data-slide-to="' +
        wn +
        '"><hr class="carousel-progress-bar" /></li>';
      $(".whatsNewList").append(str);
    });

    var percent = 0,
      interval = 30, //it takes about 6s, interval=20 takes about 4s
      $bar = $(".carousel-progress-bar"),
      $crsl = $("#myCarousel");
    $(".carousel-indicators li, .carousel-control").click(function() {
      $bar.css({ width: 0.5 + "%" });
    });

    /*line above just for showing when controls are clicked the bar goes to 0.5% to make more friendly, 
        if you want when clicked set bar empty, change on width:0.5 to width:0*/
    $crsl
      .carousel({
        //initialize
        interval: false,
        pause: true
      })
      .on("slide.bs.carousel", function() {
        percent = 0;
      }); //This event fires immediately when the bootstrap slide instance method is invoked.

    function progressBarCarousel() {
      $bar.css({ width: percent + "%" });
      percent = percent + 0.5;
      if (percent >= 100) {
        percent = 0;
        $crsl.carousel("next");
      }
    }
    var barInterval = setInterval(progressBarCarousel, interval); //set interval to progressBarCarousel function
    if (!/Mobi/.test(navigator.userAgent)) {
      //tests if it isn't mobile
      $crsl.hover(
        function() {
          clearInterval(barInterval);
        },
        function() {
          barInterval = setInterval(progressBarCarousel, interval);
        }
      );
    }
  });

  $scope.ok = function() {
    localStorage.setItem("icuVersion", window.config.version);
    $uibModalInstance.dismiss("cancel");
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss("cancel");
  };
}
