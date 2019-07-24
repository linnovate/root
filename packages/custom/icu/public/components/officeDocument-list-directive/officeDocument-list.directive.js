"use strict";

angular
  .module("mean.icu.ui.officedocumentlistdirective", ["dragularModule"])
  .directive("icuOfficeDocumentList", function(
    $state,
    $uiViewScroll,
    $stateParams,
    $timeout,
    context,
    UsersService,
    LayoutService
  ) {
    var creatingStatuses = {
      NotCreated: 0,
      Creating: 1,
      Created: 2
    };

    function controller(
      $scope,
      orderService,
      OfficeDocumentsService,
      dragularService,
      $element,
      $interval,
      $window
    ) {
      $scope.currentOfficeDocumentId = function(id) {
        $scope.officeDocumentId = id;
      };

      $scope.context = context;

      _($scope.officedocuments).each(function(t) {
        t.__state = creatingStatuses.Created;
        t.PartTitle = t.title;
      });

      if (context.entityName === "all") {
        $scope.detailsState = "main.officeDocuments.all.details";
      } else if (context.entityName === "my") {
        $scope.detailsState = "main.officeDocuments.byassign.details";
      } else if (context.entityName === "officeDocument") {
        $scope.detailsState = "main.officeDocuments.byparent.details";
      } else {
        $scope.detailsState = "main.officeDocuments.byentity.details";
      }
    }

    function link($scope, $element) {
      var isScrolled = false;

      $scope.initialize = function($event, officeDocument) {
        if ($scope.displayOnly) {
          return;
        }

        var nameFocused = angular.element($event.target).hasClass("name");
        officeDocument.PartTitle = officeDocument.title;

        if (officeDocument.__state === creatingStatuses.NotCreated) {
          $scope.createOrUpdate(officeDocument).then(function() {
            $state.go($scope.detailsState, {
              id: officeDocument._id,
              entity: context.entityName,
              entityId: context.entityId,
              nameFocused: nameFocused
            });
          });
        } else {
          $state.go($scope.detailsState + ".activities", {
            id: officeDocument._id,
            entity: context.entityName,
            entityId: context.entityId,
            nameFocused: nameFocused
          });
        }

        LayoutService.clicked();
      };

      $scope.isCurrentState = function(id) {
        var isActive =
          ($state.current.name.indexOf(
            "main.officeDocuments.byparent.details"
          ) === 0 ||
            $state.current.name.indexOf(
              "main.officeDocuments.byentity.details"
            ) === 0 ||
            $state.current.name.indexOf("main.officeDocuments.all.details") ===
              0) &&
          $state.params.id === id;

        if (isActive && !isScrolled) {
          $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
          isScrolled = true;
        }

        return isActive;
      };

      $scope.loadMore = function() {
        if (!$scope.isLoading && $scope.loadNext) {
          $scope.loadNext().then(function(response) {
            let { data, prev, next } = response;

            data.forEach(doc => {
              doc.__state = creatingStatuses.Created;
              doc.PartTitle = doc.title;
            });

            $scope.officedocuments = $scope.officedocuments.concat(data);

            $scope.loadNext = next;
            $scope.loadPrev = prev;
          });
        }
      };
    }

    return {
      restrict: "A",
      templateUrl:
        "/icu/components/officeDocument-list-directive/officeDocument-list.directive.template.html",
      scope: {
        officedocuments: "=",
        loadNext: "=",
        loadPrev: "=",
        drawArrow: "=",
        groupOfficeDocuments: "=",
        order: "=",
        displayOnly: "=",
        autocomplete: "="
      },
      link: link,
      controller: controller
    };
  });
