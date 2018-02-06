'use strict';

angular.module('mean.icu.ui.sidepane', []).
directive('icuSidepane', function() {
    function controller($scope, $state, $stateParams, context, NotifyingService, TasksService, $rootScope, SearchService, $filter, $location, EntityService) {
        $scope.context = context;
        $scope.recycled = $location.path().split("/").pop() === "recycled";

        $scope.folders = $scope.folders.data || $scope.folders;
        $scope.offices = $scope.offices.data || $scope.offices;
        $scope.projects = $scope.projects.data || $scope.projects;
        $scope.attachments = $scope.officeDocuments.data || $scope.officeDocuments;
        $scope.discussions = $scope.discussions.data || $scope.discussions;
        $scope.officeDocuments = $scope.officeDocuments.data || $scope.officeDocuments;
        //$scope.templateDocs = $scope.templateDocs.data || $scope.templateDocs;
        $scope.people = $scope.people.data || $scope.people;
        $scope.toggleVisibility = function(toggledItem) {
            let prev = toggledItem.open;

            $scope.items.forEach(function(i) {
                i.open = false;
            });

            toggledItem.open = !prev;
        };

        $scope.removeFilterValue = function() {
            TasksService.filterValue = false;
        };

        // updatedDate
        let lastMonth = new Date();
        lastMonth.setDate(lastMonth.getMonth() -1 ) ;
        $scope.updatedDate = lastMonth ;
        SearchService.filteringByUpdated = $scope.updatedDate;

        // activeToggle
        $scope.activeToggleList = EntityService.activeToggleList;
        $scope.activeToggle = {
            field: !EntityService.isActiveStatusAvailable() ? 'all' : $stateParams.activeToggle || 'active',
            disabled: !EntityService.isActiveStatusAvailable()
        };
        /*---*/

        $scope.isCurrentState = function(item) {

            if ((context.main === 'templateDocs') && (item.display !== undefined) && (item.display[1] === 'templateDocs'))
            {
                return true;
            }
            else if ((context.main === 'offices') && (item.display !== undefined) && (item.display[0] === 'offices'))
            {
                return true;
            }

            if (item.state.includes("."))
            {
                return item.state.split(".")[0] === context.main;
            }
            else
            {
                return item.state === context.main;
            }

            //return item.state === context.main;
        };

        $scope.GoToMyTasks = function() {
            $state.go('main.tasks.byassign');
        };

        $scope.items = [{
            name: 'search',
            icon: '/icu/assets/img/search-nav.svg',
            state: 'search.all',
            display: ['projects', 'discussions', 'people'],
            open: $scope.isCurrentState({state: 'tasks'})
        }, {
            name: 'tasks',
            icon: '/icu/assets/img/task.png',
            state: 'tasks.all',
            display: ['projects', 'discussions', 'people'],
            open: $scope.isCurrentState({state: 'tasks'})
        }, {
            name: 'projects',
            icon: '/icu/assets/img/project.png',
            state: 'projects.all',
            display: ['discussions', 'people'],
            open: $scope.isCurrentState({state: 'projects'})
        }, {
            name: 'meetings',
            icon: '/icu/assets/img/meeting.png',
            state: 'discussions.all',
            display: ['projects', 'people'],
            open: $scope.isCurrentState({state: 'discussions'})
        },
            {
                name: 'Documents',
                icon: '/icu/assets/img/document-nav.svg',
                state: 'officeDocuments.all',
                display: ['folders'],//['new', 'received', 'inProgress'],
                open: $scope.isCurrentState({state: 'officeDocuments'})
            },
            {
                name: 'settings',
                icon: '/icu/assets/img/settings.png',
                state: 'folders.all',
                display: ['offices', 'templateDocs'],
                open: $scope.isCurrentState({state: 'folders'})
            }
            // , {
            //     name: 'people',
            //     icon: '/icu/assets/img/people.png',
            //     state: 'people',
            //     display: ['projects', 'discussions'],
            //     open: false
            // }
        ];
        $scope.activeTab = $stateParams.activeTab || $scope.items[1];
        $scope.savedTab = $stateParams.activeTab;

        $scope.setActive = function(item){
            $scope.activeTab = item;
            $scope.$broadcast('sidepan', item,
                $scope.context, $scope.folders,
                $scope.offices, $scope.projects,
                $scope.discussions, $scope.officeDocuments,
                $scope.people);
        };

        NotifyingService.subscribe('activeSearch', function () {
            $scope.activeTab = $scope.items[0];
        }, $scope);

        $scope.menuColorStyles = [
            'pinkTab',
            'blueTab',
            'greenTab',
            'purpleTab',
            'yellowTab',
            'darkBlueTab',
            'redTab',
        ];

        $scope.getNavColor = function(item, index){
            for(let i = 0; i < $scope.items.length ; i++){
                if($scope.activeTab.name === item.name){
                    $scope.$broadcast('sidepan', item,
                        $scope.context, $scope.folders,
                        $scope.offices, $scope.projects,
                        $scope.discussions, $scope.officeDocuments,
                        $scope.people);
                    return $scope.menuColorStyles[index];
                }
            }
        };

        /********************************** search **********************************/

        $scope.issues = [
            {label:'tasks', value: false, name: 'task', length: 0},
            {label:'projects', value: false, name: 'project', length: 0},
            {label:'discussions', value: false, name: 'discussion', length: 0},
            {label:'offices', value: false, name: 'office', length: 0},
            {label:'folders', value: false, name: 'folder', length: 0},
            {label:'Attachments', value: false, name: 'attachment', length: 0},
            {label:'documents', value: false, name: 'officeDocument', length: 0}
        ];

        $scope.filteringData = {
            issue: $location.$$search && $location.$$search.type ? $location.$$search.type : 'all',
            selectedEntities: {
                projects: {},
                discussions: {},
                folders: {},
                attachments: {},
                offices: {},
            },
            selectedWatchers: {},
            projects: [],
            discussions: [],
            folders: [],
            offices: [],
            watchers: []
        };

        $scope.displayLimit = {
            projects : 4,
            discussions : 4,
            offices: 4,
            folders: 4,
            watchers: 2,
            people: 2,
            default : {
                projects: 4,
                discussions: 4,
                offices: 4,
                folders: 4,
                attachments: 4,
                watchers: 2,
                people: 2,
            }
        };

        let getEntitiesAndWatchers = function(filteredByType) {
            for (let i=0; i< filteredByType.length; i++) {
                if (filteredByType[i].project)
                    $scope.filteringData.projects.push(filteredByType[i].project);
                if (filteredByType[i].discussions && filteredByType[i].discussions.length)
                    $scope.filteringData.discussions.push(filteredByType[i].discussions[0]);
                if (filteredByType[i].folder)
                    $scope.filteringData.folders.push(filteredByType[i].folder);
                if (filteredByType[i].office)
                    $scope.filteringData.offices.push(filteredByType[i].office);
                if (filteredByType[i].attachment)
                    $scope.filteringData.attachments.push(filteredByType[i].attachment);
                if (filteredByType[i].watchers && filteredByType[i].watchers.length)
                    $scope.filteringData.watchers = $scope.filteringData.watchers.concat(filteredByType[i].watchers)
            }

            $scope.filteringData.projects = $scope.projects.filter(function(e) {
                return $scope.filteringData.projects.indexOf(e._id) > -1;
            });
            $scope.filteringData.discussions = $scope.discussions.filter(function(e) {
                return $scope.filteringData.discussions.indexOf(e._id) > -1;
            });
            $scope.filteringData.folders = $scope.folders.filter(function(e) {
                return $scope.filteringData.folders.indexOf(e._id) > -1;
            });
            $scope.filteringData.offices = $scope.offices.filter(function(e) {
                return $scope.filteringData.offices.indexOf(e._id) > -1;
            });

            $scope.filteringData.attachments = $scope.attachments.filter(function(e) {
                return $scope.filteringData.offices.indexOf(e._id) > -1;
            });

            $scope.filteringData.watchers = $scope.people.filter(function(e) {
                return $scope.filteringData.watchers.indexOf(e._id) > -1;
            });

            SearchService.filteringData = $scope.filteringData;
        };

        $state.current.reloadOnSearch = false;

        let issuesOrder = $scope.issues.map(function(i) {
            return i.name;
        });

        $scope.filterSearchByType = function() {
            if ($scope.filteringData.issue === 'all') {
                $location.search('');
            } else {
                $location.search('type', $scope.filteringData.issue);
            }
            let results = SearchService.results;
            if (!results || !results.length) return ;
            let filteredByType = [], index;

            for (let i = 0; i < $scope.issues.length; i++) {
                $scope.issues[i].length = 0;
            }
            for (let i=0; i< results.length; i++) {
                if (results[i]._type === $scope.filteringData.issue || $scope.filteringData.issue === 'all') {
                    filteredByType.push(results[i])
                }
                index = issuesOrder.indexOf(results[i]._type);
                $scope.issues[index].length++;
            }
            SearchService.filteringResults = filteredByType;

            getEntitiesAndWatchers(filteredByType)
        };

        let getTruth = function(obj) { // return truth value in a single object
            let arr = [];
            for (let key in obj) {
                if (obj[key]) {
                    arr.push(key)
                }
            }
            return arr;
        };

        $scope.filterSearchByEntity = function() {
            let filteringResults = SearchService.filteringResults;
            let projects = getTruth($scope.filteringData.selectedEntities.projects);
            let discussions = getTruth($scope.filteringData.selectedEntities.discussions);
            let folders = getTruth($scope.filteringData.selectedEntities.folders);
            let offices = getTruth($scope.filteringData.selectedEntities.offices);
            if (!projects.length && !discussions.length && !folders.length && !offices.length)
                return;
            let filteredByEntity = [];
            for (let i=0; i< filteringResults.length; i++) {
                if (filteringResults[i].project && projects.indexOf(filteringResults[i].project) > -1 ||
                    filteringResults[i].folder && folders.indexOf(filteringResults[i].folder) > -1 ||
                    filteringResults[i].office && offices.indexOf(filteringResults[i].office) > -1)
                    filteredByEntity.push(filteringResults[i]);
                if (filteringResults[i].discussions && filteringResults[i].discussions.length && discussions.indexOf(filteringResults[i].discussions[0]) > -1)
                    filteredByEntity.push(filteringResults[i]);
            }
            SearchService.filteringResults = filteredByEntity;
        };

        $scope.filterSearchByWatcher = function() {
            let filteringResults = SearchService.filteringResults;
            let watchers = getTruth($scope.filteringData.selectedWatchers);
            if (!watchers.length) return;
            let filteredByWatchers = [];
            for (let i=0; i< filteringResults.length; i++) {
                if (_.intersection(filteringResults[i].watchers, watchers).length)
                    filteredByWatchers.push(filteringResults[i]);
            }
            SearchService.filteringResults = filteredByWatchers;
        };


        ////******* */
        $scope.updatedOptions = {
            onClose: (value/*, picker, $element*/) => {
//                        console.log("on close", value, picker, $element) ;
                let splut = value.split('.');
                let valueChanged = new Date(splut[2],splut[1] -1 ,splut[0]) ;
                $scope.updatedDate = new Date(value) ;
                document.getElementById('ui-datepicker-div').style.display = 'block';
                SearchService.filteringByUpdated = valueChanged;
//                        console.log("SearchService.filteringByUpdated", SearchService.filteringByUpdated)
                $state.go('main.search', { dateUpdated: value }) ;
            },
            dateFormat: 'd.m.yy'
        };

        ////******* */

        $scope.filterActive = function () {
            EntityService.activeStatusFilterValue = $scope.activeToggle.field ;
            $state.go($state.current.name, { activeToggle: $scope.activeToggle.field });
        };

        $scope.toggleRecycle = function () {
            console.log("toggleRecycle...") ;
            $scope.recycled = $location.path().split("/").pop() === "recycled";

            $scope.recycled = !$scope.recycled ;

            $scope.recycledClass =  $scope.recycled ? "recycled" : '';
            if($scope.recycled === false) {
                $state.go('main.search', {reload: true});
            }
            else {
                $state.go('main.search.recycled');
            }
        };

        $scope.filterSearch = function() {
            $scope.filterSearchByType();
            $scope.filterSearchByEntity();
            $scope.filterSearchByWatcher();
        };

        $scope.resetFilter = function() {
            $scope.filteringData.selectedEntities = {
                projects: {},
                discussions: {},
                folders: {},
                attachments: {},
                offices: {}
            };
            $scope.filteringData.selectedWatchers = {};
        };

        $scope.closeSearch = function(){
            $state.go('main.tasks')
        };

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            if (toState.name.indexOf('search') > -1) {
                $scope.filterSearch();
            }
        });

    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/sidepane/sidepane.html',
        scope: {
            me: '=',
            projects: '=',
            discussions: '=',
            offices: '=',
            folders: '=',
            people: '=',
            officeDocuments: '=',
            templateDocs: '=',
            currentState: '@',
            changeLayout: '=',
            getSideMenuIcon: '=',
            filterSearchByType: '=',
            filterSearchByEntity: '=',
            filterSearchByWatcher: '=',
            filterSearch: '=',
            filteringData: '=',
            resetFilter: '=',
            getEntitiesAndWatchers: '=',
        }
    };
});
