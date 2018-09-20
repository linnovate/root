'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <div acme-order-calendar-range></div>
 */

function EntityListController($scope, $window, $state, context, $filter, $stateParams, EntityService, dragularService, $element, $interval, $uiViewScroll, $timeout, LayoutService, UsersService, TasksService, PermissionsService, MultipleSelectService, NotifyingService) {

    // ============================================================= //
    // ========================= navigate ========================== //
    // ============================================================= //
    $scope.unifiedRowTpl = '/icu/components/entity-list/regions/row.html';

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
    } else if (
      (context.entityName === 'task' || context.entityName === 'project')
     && $state.current.name.indexOf('byparent') !== -1) {
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

        $scope.refreshVisibleItems();

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

    $scope.context = context;
    $scope.isLoading = true;


    let inCurrentEntity = (entity)=> $state.current.name.indexOf(entity) !== -1;

    $scope.showTaskExcel = inCurrentEntity('tasks')
    $scope.showOfficeDocumentsExcel = inCurrentEntity('offices');


    let tasksExcelHandler = TasksService.excel;
    $scope.taskExcel = tasksExcelHandler;
    $scope.excel = {
        selected:{title:""},
        officeList:_.filter($scope.offices,(office)=>office.title&&office.title!=="")
    };



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
        if ($state.current.name.indexOf("byentity") !== -1 || $state.current.name.indexOf("byparent") !== -1) {
            var parent = {};
            parent.type = $state.current.params.entity || 'parent';
            parent.id = $state.current.params.entityId;
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
            $scope.refreshVisibleItems();
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
    // =================== multiple operations ===================== //
    // ============================================================= //

    $scope.mouseOnMultiple = false;
    $scope.multipleSelectMode = false;
    $scope.selectedItems = MultipleSelectService.refreshSelectedList();
    $scope.cornerState = MultipleSelectService.getCornerState();
    NotifyingService.notify('multipleDisableDetailsPaneCheck');

    $scope.multipleSelectRefreshSelected = function (entity) {
        MultipleSelectService.refreshSelectedList(entity);
        multipleSelectRefreshState();
    };

    $scope.$on('changeCornerState', function(event, cornerState){
        multipleSelectSetAllSelected(cornerState === 'all');
    });

    function multipleSelectSetAllSelected(status){
        for(let i = 0; i < $scope.visibleItems.length; i++){
            $scope.visibleItems[i].selected = status;
        }
        if(status){
            MultipleSelectService.setSelectedList($scope.visibleItems);
        } else {
            MultipleSelectService.refreshSelectedList();
        }
        multipleSelectRefreshState();
    }

    NotifyingService.subscribe('refreshAfterOperation', () => {
        multipleSelectRefreshState();
        $scope.refreshVisibleItems();
    }, $scope);

    $scope.cursorEnterMultiple = function(mouseOn){ $scope.mouseOnMultiple = !!mouseOn };
    $scope.showTick = function(item){ item.visible = true };
    $scope.hideTick = function(item){ item.visible = false };

    $scope.checkForHideMultiple = function(){
        if(MultipleSelectService.getCornerState() === 'none'){
            changeMultipleMode(false);
        }
    };

    function multipleSelectRefreshState(){
        $scope.selectedItems = getFilteredSelectedList();
        refreshActiveItemsInList();
        $scope.cornerState = getRefreshedCornerState();

        if ($scope.selectedItems.length) {
            changeMultipleMode(true);
        } else {
            MultipleSelectService.refreshSelectedList();
        }

        multipleDisablingCheck();
        $scope.$broadcast('refreshBulkButtonsAccess');
        NotifyingService.notify('multipleDisableDetailsPaneCheck');
    }

    function multipleDisablingCheck(){
        if(!$scope.selectedItems.length && !$scope.mouseOnMultiple){
            changeMultipleMode(false);
        }
    }

    function changeMultipleMode(value){
        $scope.multipleSelectMode = value;
    }

    function getFilteredSelectedList(){
        let selected = MultipleSelectService.getSelected();
        let filteredSelected = filterResults(selected);
        let newSelectedList = MultipleSelectService.setSelectedList(filteredSelected);

        return newSelectedList;
    }

    function getRefreshedCornerState(){
        let filteredItems = filterResults($scope.visibleItems);
        let refreshedCornerState = MultipleSelectService.refreshCornerState(filteredItems.length);

        return refreshedCornerState;
    }

    function refreshActiveItemsInList(){
        for(let item of $scope.visibleItems){
            let entity = $scope.selectedItems.find( selectedItems => selectedItems._id === item._id );
            item.selected = !!entity;
        }
    }

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
        let loadedVisibleCount = 0;
        let listEnd = false;

        loadWithVisibleCheck(listEnd, loadedVisibleCount);

        function loadWithVisibleCheck(listEnd, loadedVisibleCount) {
            if (!$scope.isLoading) {
                if (loadedVisibleCount < 25 && !listEnd) {
                    var start = $scope.items.length;
                    var sort = 'created';
                    //$scope.order.field;
                    $scope.$parent.loadMore(start, LIMIT, sort).then(result => {
                        if (result.length === 0) listEnd = true;
                        loadedVisibleCount += filterResults(result).length;
                        $scope.refreshVisibleItems();
                        loadWithVisibleCheck(listEnd, loadedVisibleCount);
                    })
                }
            }
        }
    };

    $scope.refreshVisibleItems = function() {
        let typeOfService = $stateParams.id ? context.main : context.entityName ;
        let serviceName = PermissionsService.serviceMap[typeOfService];

        if ($stateParams.starred) {
            return serviceName.getStarred()
                .then(starred => {
                    if($stateParams.starred){
                        $scope.items = $scope.items.filter( entity => _.includes(getArrIds(starred), entity._id) );
                    }
                    $scope.visibleItems = removeDuplicates((filterResults($scope.items)))
                })
        } else {
            $scope.visibleItems = removeDuplicates(filterResults($scope.items))
        }

    };

    function getArrIds(arr){
        return arr.map( entity => entity._id )
    }

    function setStatusFilterValue(value){
      let newActiveToggleField;
      if(!value)value = 'all';
      if(['new', 'assigned', 'in-progress', 'review'].includes(value))newActiveToggleField = 'active';
      if(['rejected', 'done', 'archived', 'canceled', 'completed'].includes(value))newActiveToggleField = 'nonactive';

      if(newActiveToggleField)$scope.activeToggle.field = newActiveToggleField;
    }

    setStatusFilterValue($stateParams.status);
    $scope.refreshVisibleItems();

    function filterResults(itemsArray){
        let newArray = $filter('filterRecycled')(itemsArray);
        newArray = $filter('filterByOptions')(newArray);
        newArray = $filter('filterByActiveStatus')(newArray, $scope.activeToggle.field);
        if($stateParams.filterStatus)newArray = filterByDefiniteStatus(newArray, $stateParams.filterStatus);
        if($stateParams.entity)newArray = filterByParent(newArray, $stateParams.entityId);
        newArray = $filter('orderBy')(newArray, $scope.sorting.field, $scope.sorting.isReverse);

        return newArray;
    }

    function removeDuplicates(array) {
      return _.uniq(array, _.property('_id'));
    }

    function filterByDefiniteStatus(array, value){
      return array.filter( entity => entity.status === value);
    }

    function filterByParent(array, value) {
      return array.filter(entity => {
        let parent = entity[$stateParams.entity];
        return parent && (value === parent || value === parent._id);
      });
    }

    NotifyingService.subscribe('filterMyTasks', () => $scope.refreshVisibleItems(), $scope);
    $scope.$on('refreshList', () => $scope.refreshVisibleItems());

    // ============================================================= //
    // ======================== Permissions ======================== //
    // ============================================================= //

    $scope.me = {};
    UsersService.getMe().then(function(me) {
        $scope.me = me;
    });

    $scope.recycled = entity => entity && entity.hasOwnProperty('recycled');
    $scope.havePermissions = (entity, type) => PermissionsService.havePermissions(entity, type);
    $scope.haveEditiorsPermissions = entity => PermissionsService.haveEditorsPerms(entity);
    $scope.permsToSee = entity => PermissionsService.haveAnyPerms(entity)
}

angular.module('mean.icu.ui.entityList', ['dragularModule']).controller('EntityListController', EntityListController);
