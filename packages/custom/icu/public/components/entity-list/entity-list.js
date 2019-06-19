'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <div acme-order-calendar-range></div>
 */

function EntityListController($scope, $injector, $window, $state, context, $filter, $stateParams, EntityService, dragularService, $element, $interval, $uiViewScroll, $timeout, LayoutService, UsersService, TasksService, PermissionsService, MultipleSelectService, NotifyingService) {

    document.me = $scope.me.id;

    let service = $injector.get(context.main[0].toUpperCase() + context.main.slice(1) + 'Service');
    let creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    };

    // ============================================================= //
    // ========================= navigate ========================== //
    // ============================================================= //
    $scope.unifiedRowTpl = '/icu/components/entity-list/regions/row.html';
    getParentName();

    $scope.isCurrentEntityState = function(id) {
        return $state.current.name.indexOf(`main.${$scope.$parent.entityName}.byentity`) === 0 && $state.current.name.indexOf('details') === -1;
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

    $scope.seenSelectedItem = false;
    $scope.isCurrentState = function(id) {
      var isActive = (
        $state.current.name.indexOf(`main.${$scope.$parent.entityName}.byparent.details`) === 0 ||
        $state.current.name.indexOf(`main.${$scope.$parent.entityName}.byentity.details`) === 0 ||
        $state.current.name.indexOf(`main.${$scope.$parent.entityName}.all.details`) === 0
      ) && $state.params.id === id;
      if (isActive && !isScrolled) {
        $timeout(() => scrollToElement(), 0);
        isScrolled = true;
      }

      return $scope.seenSelectedItem = isActive;
    };

    function scrollToElement(){
        let list = document.getElementsByClassName('list-table scroll')[0],
            elem = document.querySelector('tr.active');
        if(!list && !elem)return;

        let listBottom = list.scrollTop + list.offsetHeight,
            elementBottom = elem.offsetTop + elem.offsetHeight;
        // if(elementBottom > listBottom)list.scrollTop = elem.offsetTop;
        if(elementBottom > listBottom)
            elem.scrollIntoView({ behavior: 'smooth' });
    }

    function getParentName(){
        if(!$scope.currentContext.entityId) return;
        let parentEntity = $scope.currentContext.entity;
        $scope.parentName = parentEntity && (parentEntity.title || parentEntity.name);

        if(!$scope.parentName){
            EntityService.getByEntityId(context.entityName + 's', context.entityId).then(entity => {
                $scope.parentName = entity.title;
            });
        }
    }

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
        if ($scope.sorting.field.title != "custom") {
            $scope.sorting.isReverse = !$scope.sorting.isReverse;
        }

        $scope.refreshVisibleItems();

        /*Made By OHAD - Needed for reversing sort*/
        $state.go($state.current, {
            sort: $scope.sorting.field.title
        });

        $scope.refreshVisibleItems();
    };

    $scope.sortingList = [{
        title: 'title',
        value: 'title'
    }, {
        title: 'status',
        value: 'status'
    }, {
        title: 'creation',
        value: 'created'
    }, {
        title: 'bolded',
        value: function(item) {
            return item.bolded.find(b => {
                return b.bolded && $scope.me._id === b.id;
            })
        }
    }];

    $scope.sorting = {
        field: $scope.sortingList.find(f => f.value == $stateParams.sort.replace(/^-/, '')),
        isReverse: $stateParams.sort[0] === '-'
    };

    if (context.entityName != "all") {
        $scope.sortingList.push({
            title: 'custom',
            value: 'custom'
        });
    }

    $scope.toggleStarred = function() {
        $state.go($state.current, {
            starred: !$stateParams.starred
        });
    };

    $scope.filterActive = function() {
        EntityService.activeStatusFilterValue = $scope.activeToggle.field;
        $state.go($state.current, {
            activeToggle: $scope.activeToggle.field
        });
    };

    // ============================================================= //
    // =========================== list ============================ //
    // ============================================================= //

    $scope.context = context;
    $scope.isLoading = false;


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

        $state.go($scope.detailsState + '.' + window.config.defaultTab, {
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
        $scope.$parent.create(parent).then((result) => {
            $scope.items.push(result);
            $scope.refreshVisibleItems();
            $timeout(() => {
              $element.find('td.name').get(0).focus();
            }, 100);
            $state.go($scope.detailsState + '.' + window.config.defaultTab, {
                id: result._id,
                entity: context.entityName,
                entityId: context.entityId,
                nameFocused: true
            });
        });
    };

    // ============================================================= //
    // =================== multiple operations ===================== //
    // ============================================================= //

    $scope.mouseOnMultiple = false;
    $scope.multipleSelectMode = false;
    $scope.selectedItems = MultipleSelectService.refreshSelectedList();
    $scope.cornerState = MultipleSelectService.getCornerState();
    NotifyingService.notify('multipleDisableDetailsPaneCheck');

    $scope.multipleSelectRefreshSelected = function (event, entity) {

        event.stopPropagation(); // Prevent $scope.onClickRow from navigating to entity details
        $state.go(`main.${context.main}.all`);

        MultipleSelectService.refreshSelectedList(entity);
        multipleSelectRefreshState();
    };

    $scope.$on('changeCornerState', (event, cornerState) => multipleSelectSetAllSelected(cornerState === 'all'));

    function multipleSelectSetAllSelected(status){
        for(let i = 0; i < $scope.visibleItems.length; i++){
            let row = $scope.visibleItems[i];

            if(!row.selected)MultipleSelectService.refreshSelectedList(row);
            row.selected = status;
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
        let selected = MultipleSelectService.getSelected(),
            filteredSelected = filterResults(selected),
            newSelectedList = MultipleSelectService.setSelectedList(filteredSelected);

        return newSelectedList;
    }

    function getRefreshedCornerState(){
        return MultipleSelectService.refreshCornerState(filterResults($scope.visibleItems).length);
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
        angular.element($event.target).css('box-shadow', 'none');

        if ($event.keyCode === 13) {
            $event.preventDefault();
            let nextElementCreated = $scope.items[index + 1];
            let nextElementInDOM = $element.find('td.name').get(index + 1);

            if (nextElementCreated && nextElementInDOM) {
                $state.go($scope.detailsState + '.' + window.config.defaultTab, {
                    id: $scope.items[index + 1]._id,
                    entity: context.entityName,
                    entityId: context.entityId,
                    nameFocused: true
                });
                nextElementInDOM.focus();
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

    $scope.displayLimit = Math.ceil($element.height() / 50);

    $scope.loadMore = function() {
        let loadedVisibleCount = 0;
        let listEnd = false;

        loadWithVisibleCheck(listEnd, loadedVisibleCount);

        function loadWithVisibleCheck(listEnd, loadedVisibleCount) {
            if (!$scope.isLoading && loadedVisibleCount < 25 && !listEnd) {

                let load;
                let alreadyLoaded = Boolean($scope.items.find(item => item._id === $stateParams.id));
                if($stateParams.id && !alreadyLoaded) {
                    let { id, limit, sort } = $state.params;
                    load = service.getAll($scope.items.length, id || limit, sort);
                } else if($scope.loadNext) {
                    load = $scope.loadNext();
                } else {
                    return;
                }

                $scope.isLoading = true;

                load.then(function (items) {
                    if (!items.data.length) listEnd = true;
                    items.data.forEach(item => {
                        item.__state = creatingStatuses.Created;
                    });

                    $scope.items = $scope.items.concat(items.data);

                    $scope.loadNext = items.next;
                    $scope.loadPrev = items.prev;

                    loadedVisibleCount += filterResults(items.data).length;
                    $scope.refreshVisibleItems();
                    $scope.isLoading = false;
                    loadWithVisibleCheck(listEnd, loadedVisibleCount);
                });
            } else {
                let isActive = Boolean($scope.visibleItems.find(item => item._id === $stateParams.id));
                if($stateParams.id && !isActive) {
                    $state.go($state.current, {
                        id: $scope.visibleItems[0]._id,
                        nameFocused: true
                    })
                }
            }
        }
    };

    $scope.refreshVisibleItems = function() {
        $scope.visibleItems = removeDuplicates(filterResults($scope.items))
    };

    function setStatusFilterValue(value){
      let newActiveToggleField;
      if(!value)value = 'all';
      if(['new', 'assigned', 'in-progress', 'review'].includes(value))newActiveToggleField = 'active';
      if(['rejected', 'done', 'archived', 'canceled', 'done'].includes(value))newActiveToggleField = 'nonactive';

      if(newActiveToggleField)$scope.activeToggle.field = newActiveToggleField;
    }

    setStatusFilterValue($stateParams.status);
    $scope.refreshVisibleItems();

    function filterResults(itemsArray){
        let newArray = $filter('filterRecycled')(itemsArray);
        newArray = $filter('filterByOptions')(newArray);
        newArray = $filter('filterByActiveStatus')(newArray, $scope.activeToggle.field);
        if($stateParams.filterStatus)newArray = filterByDefiniteStatus(newArray, $stateParams.filterStatus);
        // if($stateParams.entity)newArray = filterByParent(newArray, $stateParams.entityId);

        if($scope.sorting.field.value === 'created')
            newArray.forEach(entity => entity.created = new Date(entity.created));
        newArray = $filter('orderBy')(newArray, $scope.sorting.field.value, $scope.sorting.isReverse);

        return newArray;
    }

    function removeDuplicates(array) {
      return _.uniq(array, _.property('_id'));
    }

    function filterByDefiniteStatus(array, value){
      return array.filter( entity => entity.status === value);
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
