'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <div acme-order-calendar-range></div>
 */

function EntityListController($scope, $window, $state, context, $filter, $stateParams, EntityService, dragularService, $element, $interval, $uiViewScroll, $timeout, LayoutService, UsersService, PermissionsService) {

    // ============================================================= //
    // ========================= navigate ========================== //
    // ============================================================= //

    $scope.isCurrentEntityState = function(id) {
        return $state.current.name.indexOf(`main.${$scope.$parent.entityName}.byentity`) === 0 && $state.current.name.indexOf('details') === -1;
    }

    let possibleNavigate = $scope.$parent.items.filter(function(t) {
        return t.recycled == null;
    })

    if (possibleNavigate.length) {
        function navigateToDetails(item) {
            if (!item)
                return;

            $scope.detailsState = context.entityName === 'all' ? `main.${$scope.$parent.entityName}.all.details` : `main.${$scope.$parent.entityName}.byentity.details`;

            $state.go($scope.detailsState, {
                id: item._id,
                entity: context.entityName,
                entityId: context.entityId,
            });
        }
        if ($state.current.name === `main.${$scope.$parent.entityName}.all` || $state.current.name === `main.${$scope.$parent.entityName}.byentity` || $state.current.name === `main.${$scope.$parent.entityName}.all.details.activities` || $state.current.name === `main.${$scope.$parent.entityName}.byentity.details.activities`) {
            var date = new Date();
            var lastIndex = possibleNavigate.length - 1;
            var diff = date.getTime() - new Date(possibleNavigate[lastIndex].created).getTime();
            if (possibleNavigate[lastIndex].title == "" && diff <= 2500) {
                navigateToDetails(possibleNavigate[lastIndex]);
            } else {
                navigateToDetails(possibleNavigate[0]);
            }
        }
    } else {
        if ($state.current.name == `main.${$scope.$parent.entityName}.all.details.activities`) {
            $state.go(`main.${$scope.$parent.entityName}.all`);
        }
    }

   if (context.entityName === 'all') {
        $scope.detailsState = `main.${$scope.$parent.entityName}.all.details`;
    } else if (context.entityName === 'my') {
        $scope.detailsState = `main.${$scope.$parent.entityName}.byassign.details`;
    } else if (context.entityName === 'task') {
        $scope.detailsState = `main.${$scope.$parent.entityName}.byparent.details`;
    } else {
        $scope.detailsState = `main.${$scope.$parent.entityName}.byentity.details`;
    }

    var isScrolled = false;

    $scope.isCurrentState = function(id) {
        var isActive = ($state.current.name.indexOf(`main.${$scope.$parent.entityName}.byparent.details`) === 0 || $state.current.name.indexOf(`main.${$scope.$parent.entityName}.byentity.details`) === 0 || $state.current.name.indexOf(`main.${$scope.$parent.entityName}.all.details`) === 0) && $state.params.id === id;
        if (isActive && !isScrolled) {
            //$uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
            isScrolled = true;
        }
        return isActive;
    };

    // ============================================================= //
    // ========================== filters ========================== //
    // ============================================================= //

    $scope.print = function() {
        $window.print()
    };

    $scope.starred = $stateParams.starred;

    $scope.activeToggleList = EntityService.activeToggleList;
    $scope.activeToggle = {
        field: !EntityService.isActiveStatusAvailable() ? 'all' : $stateParams.activeToggle || 'active',
        disabled: !EntityService.isActiveStatusAvailable()
    };

    $scope.changeOrder = function() {
        if ($scope.sorting.field != "custom") {
            $scope.sorting.isReverse = !$scope.sorting.isReverse;
        }

        /*Made By OHAD - Needed for reversing sort*/
        $state.go($state.current.name, {
            sort: $scope.sorting.field
        });
    };

    $scope.sorting = {
        field: $stateParams.sort || 'created',
        isReverse: false
    };

    $scope.sortingList = [{
        title: 'title',
        value: 'title'
    }, {
        title: 'status',
        value: 'status'
    }, {
        title: 'created',
        value: 'created'
    }, {
      title: 'bolded',
      value: 'bolded.bolded'
    }];

    if (context.entityName != "all") {
        $scope.sortingList.push({
            title: 'custom',
            value: 'custom'
        });
    }

    $scope.toggleStarred = function() {
        $state.go($state.current.name, {
            starred: !$stateParams.starred
        });
    };

    $scope.filterActive = function() {
        EntityService.activeStatusFilterValue = $scope.activeToggle.field;
        $state.go($state.current.name, {
            activeToggle: $scope.activeToggle.field
        });
    };

    // ============================================================= //
    // =========================== list ============================ //
    // ============================================================= //

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    }

    $scope.context = context;
    $scope.isLoading = true;

    $scope.onClickRow = function($event, item) {
        if ($scope.displayOnly) {
            return;
        }

        var nameFocused = angular.element($event.target).hasClass('name');

        $state.go($scope.detailsState + '.activities', {
            id: item._id,
            entity: context.entityName,
            entityId: context.entityId,
            nameFocused: nameFocused
        });

        LayoutService.clicked();
    };

    $scope.onCreate = function() {
        let parent;
        if($state.current.name.indexOf("byentity") !== -1){
            parent = $state.current.params.entityId;
        }
        $scope.$parent.create(parent).then((result)=>{
            //             if (localStorage.getItem('type') == 'new') {
            //                 $state.go($scope.detailsState + '.activities', {
            //                     id: result._id,
            //                     entity: context.entityName,
            //                     entityId: context.entityId,
            //                     nameFocused: false,
            //                     officeDocuments
            //                 });
            //             } else {
            $timeout(()=> {
              let els = $element.find('td.name');
              els.length && els[els.length - 1].focus();
            },100);
            $state.go($scope.detailsState + '.activities', {
                id: result._id,
                entity: context.entityName,
                entityId: context.entityId,
                nameFocused: true
            });
            //             }

        }
        );
    };

    // ============================================================= //
    // ======================= item function ======================= //
    // ============================================================= //

    $scope.onKeydown = function($event, index) {
        angular.element($event.target).css('box-shadow', 'none')

        if ($event.keyCode === 13) {
            $event.preventDefault();

            if ($element.find('td.name')[index + 1] && $scope.items[index + 1]) {
                $state.go($scope.detailsState + '.activities', {
                    id: $scope.items[index + 1]._id,
                    entity: context.entityName,
                    entityId: context.entityId,
                    nameFocused: true
                });
                $element.find('td.name')[index + 1].focus();
            } else {
                $scope.onCreate();
            }
            //             var sr = $scope.searchResults[$scope.selectedSuggestion];
            //              $scope.select(sr);
        }
    }
    $scope.focusing = function(entity){
        entity.focus = true;
    };
    $scope.bluring = function(entity, $event){
        entity.focus = false;

        var scrollLeft = function(element){
            element.scrollLeft = 0;
        };
        var scrollRight = function(element){
            element.scrollLeft += $event.target.scrollWidth - $event.target.scrollLeft;
        };

        let usingFunction = config.direction === 'rtl' ? scrollRight : scrollLeft;
        usingFunction($event.target);
    };

    //     $scope.onBlur = function(item) {
    //         item.__autocomplete = false;
    //         $scope.searchResults.length = 0;
    //         $scope.selectedSuggestion = 0;
    //     }

    // infinite scroll
    //     $timeout(function() {
    $scope.displayLimit = Math.ceil($element.height() / 50);
    $scope.isLoading = false;
    //     }, 0);

    $scope.loadMore = function() {
        var LIMIT = 25;

        if (!$scope.isLoading) {
            var start = $scope.items.length;
            var sort = 'created';
            //$scope.order.field;
            $scope.$parent.loadMore(start, LIMIT, sort);
        }
    };

    // ============================================================= //
    // ======================== Permissions ======================== //
    // ============================================================= //

    $scope.me = {};
    UsersService.getMe().then(function(me) {
        $scope.me = me;
    });

    $scope.recycled = function(entity) {
        if (entity && entity.hasOwnProperty('recycled'))
            return true;
        return false;
    }

    $scope.havePermissions = function(entity, type) {
        return PermissionsService.havePermissions(entity, type);
    }

    $scope.haveEditiorsPermissions = function(entity) {
        return PermissionsService.haveEditorsPerms(entity);
    }

    $scope.permsToSee = function(entity) {
      return PermissionsService.haveAnyPerms(entity);
    }

}

angular.module('mean.icu.ui.entityList', ['dragularModule']).controller('EntityListController', EntityListController);
