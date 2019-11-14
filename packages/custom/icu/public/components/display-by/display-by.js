
'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope, $state, context,SettingServices,SearchService,EntityService, $rootScope, $stateParams,$location, $window,NotifyingService,UsersService, TasksService,ProjectsService,DiscussionsService,OfficesService,TemplateDocsService, OfficeDocumentsService, FoldersService) {
        $scope.statusList = SettingServices.getStatusList();
        $scope.activeList = SettingServices.getActiveStatusList();
        $scope.archiveList = SettingServices.getNonActiveStatusList();
        $scope.userFilterList = SettingServices.getUserFilter();
        $scope.tasksList = [];
        $scope.projectsList = [];
        $scope.discussionsList = [];
        $scope.officeDocumentsList = [];

        $rootScope.$on('changeStatus',function(){
          $scope.AllStatus = $scope.statusList[$scope.filteringData.issue];
        });

        function arrayUnique(array) {
            var a = array.concat();
            for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                    if(a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
        }
        $scope.currentType = 'All';

        $scope.clearDateRange = function(){
            SearchService.filterDateOption = null;
            $scope.datePicker.date = {startDate: null, endDate: null};
        };

        $scope.removeTags = function(text){
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };

        $scope.clearDueDate = function() {
            SearchService.filteringByDueDate = $scope.dueDate = null;
        };

        $scope.clearUpdatedDate = function() {
            SearchService.filteringByUpdated = $scope.updatedDate = null;
        };

        //clearing default date filter
        $scope.clearDateRange();
        $scope.clearDueDate();
        $scope.clearUpdatedDate();

        $scope.turnOffRecycle = function () {
            var query = SearchService.getQuery();
            $scope.recycled = false;
            $scope.isRecycled = false;
            $state.go('main.search', {reload: true, query: query});
        };

        $scope.tmpStatus = [];

          $scope.statusListChange = function(type){
            var index;
            if($scope.currentType == 'active'){
                if ($scope.activeList.indexOf(type) < 0)
                $scope.activeList.push(type);
                  else {
                      index = $scope.activeList.indexOf(type);
                      $scope.activeList.splice(index , 1);
                  }
            }
            else if($scope.currentType == 'nonactive'){
                // archiveList.push(type);
                if ($scope.archiveList.indexOf(type) < 0)
                $scope.archiveList.push(type);
                else {
                   index = $scope.archiveList.indexOf(type);
                   $scope.archiveList.splice(index , 1);
                }
            }
            else {
                $scope.currentType = 'all';
                if ($scope.userFilterList.indexOf(type) < 0)
                    $scope.userFilterList.push(type);
                else {
                   index = $scope.userFilterList.indexOf(type);
                    $scope.userFilterList.splice(index , 1);
                }
            }
        };

        $scope.isActive = function(type, status){
            if ( status !== 'active' && status !== 'nonactive' && $scope.tmpStatus.length && $scope.tmpStatus.indexOf(type)> -1)
                return true;
            if (status !== 'active' && status !== 'nonactive' && status == type)
                return true;
            else {
                if($scope.currentType == 'all') {
                    if ($scope.userFilterList.indexOf(type) > -1)
                        return true;
                }
                if($scope.currentType == 'active'){
                    if ($scope.activeList.indexOf(type) >-1)
                        return true;
                }
                if($scope.currentType == 'nonactive'){
                    if ($scope.archiveList.indexOf(type) >-1)
                    return true;
                }
            }
            return false;
        }

        $scope.AllStatus = [];

        $scope.showM = function(type){
            $scope.currentType = type;
            if (type == 'empty'){
              $scope.AllStatus = [];
              $scope.activeList = SettingServices.getActiveStatusList();
              $scope.archiveList = SettingServices.getNonActiveStatusList();
              $scope.userFilterList = SettingServices.getUserFilter();
            }
            else if ($location.search().type)
              $scope.AllStatus = $scope.statusList[$scope.filteringData.issue];
            else $scope.AllStatus =  arrayUnique($scope.activeList.concat($scope.archiveList));
            $scope.tmpStatus = [];
        }

        $scope.createLists = function(){
          return new Promise((resolve) => {
            resolve();
          }).then(() => {
            $scope.officesList = [];
            return OfficesService.getAll(0, 0, 'created').then(offices => {
              $scope.offices = offices.data || offices;
              $scope.offices.forEach(function (office) {
                if (office.title)
                  $scope.officesList.push(office);
              });
            });
          }).then(() => {
            return FoldersService.getAll(0, 0, 'created').then(folders => {
              $scope.folders = folders.data || folders;
              $scope.foldersList = $scope.folders.filter(filterEntities);
            });
          }).then(() => {
            if ($scope.officesList.length > 0) {
              $scope.officesList.office = $scope.officesList[0];
            }
          });
        };

        $scope.typeClicked = false;

        function filterEntities(item) {
            return item.title && item._id && !item.recycled;
        }

        NotifyingService.subscribe('editionData', function () {
            TasksService.getAll(0, 25, '-created').then(function (data) {
                $scope.tasks = data.data || data;
                $scope.tasksList = $scope.tasks.filter(filterEntities);
            });

            ProjectsService.getAll(0, 25, '-created').then(function (data) {
                $scope.projects = data.data || data;
                $scope.projectsList = $scope.projects.filter(filterEntities);
            });

            DiscussionsService.getAll(0, 25, '-created').then(function (data) {
                $scope.discussions = data.data || data;
                $scope.discussionsList = $scope.discussions.filter(filterEntities);
            });

            OfficeDocumentsService.getAll(0, 25, '-created').then(function (data) {
                $scope.officeDocuments = data.data || data;
                $scope.officeDocumentsList = $scope.officeDocuments.filter(filterEntities);
            });

            $scope.createLists();
        }, $scope);

        NotifyingService.notify('editionData');

        $scope.focus = false;
        $scope.changeFocus = function(){
            $scope.focus = !$scope.focus;
        };

        $scope.myFilter = function (item) {
            if(item.office.title && $scope.officesList.office.title)
            {
                return item.office.title === $scope.officesList.office.title;
            }
            else
            {
                return false;
            }

        };

        $scope.getLinkUrl = function(){
            return $state.href('main.' + $scope.activeTab.state ,{'officeDocuments':undefined});
        };

        //$scope.temp = {};
        $scope.changeOrder = function () {
            //$scope.temp.office = $scope.officesList.office;

            // if($scope.officesList.office.title != "custom"){
            //     $scope.sorting.isReverse = !$scope.sorting.isReverse;
            // }

            /*Made By OHAD - Needed for reversing sort*/
            //$state.go($state.current.name, { sort: $scope.officesList.office.title });
        };

        $scope.goToParentState = function(){

        };

        $scope.typesList = [{
            name: 'new',
             color:'ff4081'
        },{
            name:  'received',
            color:'37afef'
        },{
            name:  'in-progress',
            color:'f69679'
         },{
            name:  'sent',
            color:'359123'
        },{
            name:  'done',
            color:'757575'
        }];

        $scope.typeSelected = $state.current.params.status;

        $scope.singularItemName = {
            tasks: "task",
            projects: "project",
            discussions: "discussion",
            officeDocuments: "officeDocument",
            offices: "office",
            folders: "folder",
            watchers: "watcher"
        };

        $scope.allItems = {
            tasks: $scope.tasks,
            projects: $scope.projects,
            discussions: $scope.discussions,
            officeDocuments: $scope.officeDocuments,
            offices: $scope.offices,
            folders: $scope.folders
        };

        $scope.context = context;

        $window.onbeforeunload = function(){
            localStorage.removeItem("type");
        };

        $scope.reset = function(main){
          $stateParams.filterStatus = null;
          $state.go('main.' + context.main + '.all',
            {reload:true}
          );
        };

        $scope.changeState = function(state){
            $state.go(state, {
                //officeDocuments: undefined,
                status:undefined,
                activeTab: $scope.item
            }, {reload: true});
        };

        //$scope.typeSelected = localStorage.getItem("type");

        $scope.switchToType = function (type) {

            if(context.entityName == "folder"){
                $state.go('main.' + context.main + '.byentity', {
                    entity: context.entityName,
                    entityId: context.entityId,
                    status: type.name
                });
                $scope.typeSelected = type.name;
            }else{
                $state.go('main.' + context.main + '.all',
                  {filterStatus : type.name},
                  {reload:true}
                  );
            }



             EntityService.setActiveStatusFilterValue(type.name);
        //     OfficeDocumentsService.getAll(0,25,EntityService.getSortFilterValue().field, EntityService.getSortFilterValue().order,type.name).then(function (results) {
        //     $scope.officeDocuments=[];
        //     results.data.forEach(function(result){
        //         var flag = false;
        //         if(context.entityName='folder'){
        //             if(result.status==type.name&&result.folder&&result.folder._id==context.entityId){
        //                 flag = true;
        //             }
        //         }
        //         else{
        //             if(result.status==type.name){
        //                 flag= true;
        //             }
        //         }
        //         if(flag){
        //             $scope.officeDocuments.push(result);
        //         }

        //     });


        //  /**
        //  if (context.entityName == 'folder') {
        //      $scope.officeDocuments = $scope.officeDocuments.filter(function (officeDocument) {
        //          return officeDocument.status == type.name && officeDocument.folder && officeDocument.folder._id == context.entityId;
        //      });
        //  } else {

        //      $scope.officeDocuments = $scope.officeDocuments.filter(function (officeDocument) {
        //          return officeDocument.status == type.name;
        //      });
        //  }
        //  */

        //  localStorage.setItem("type", type.name);

        //  $state.go($state.current, {
        //      officeDocuments: $scope.officeDocuments,
        //      activeTab: $scope.item
        //  }, { reload: true });
        //     });

         /**
         var temp=[];
         $scope.officeDocuments.forEach(function(d){
             temp.push(d);
         });
         temp = temp.filter(function(officeDocument){
             if(context.entityName=='folder'){
                 return officeDocument.status == type.name &&officeDocument.folder&& officeDocument.folder._id==context.entityId ;
             }
             else{
                 return officeDocument.status == type.name;
             }
          });
           /*if(context.entityName == 'all'){
             $state.go('main.' + context.main + '.all', {},{reload: true});
         }else if (context.entityName == 'folder'){
             $state.go('main.' + context.main + '.byentity', {
                 entityId: context.entityId,
                 entity: 'folder',
                 officeDocuments: temp
             },{reload: true});
         }*/
     };
        $scope.switchTo = function (entityName, id) {
            EntityService.setEntityFolderValue(entityName, id);
                $state.go('main.' + context.main + '.byentity', {
                entity: entityName,
                entityId: id,
                status:undefined
            });

            $scope.typeSelected = '';

            // If we are switching between entities, then shrink the display limit again
            if (!$scope.visible[entityName]) {
                $scope.displayLimit.reset();
            }

        };

        $scope.switchToAll = function (entityName, id) {
            $state.go('main.' + context.main + '.all.details.activities', {
                id: id,
                entity: entityName,
            });
        };

        $scope.visible = {
            task: true,
            project: true,
            discussion: true,
            user: true,
            officeDocument: true,
            office: true,
            folder: true
        };

        $scope.visible[$scope.context.entityName] = true;

    }

        function link($scope, $element, context) {
            $scope.showMore = function(limit, entityName) {
                if (($scope.displayLimit[entityName] + 4) >= limit) {
                    $scope.displayLimit[entityName] = limit;
                } else {
                    $scope.displayLimit[entityName]  += 4;

                }
            };

            $scope.collapse = function(entityName) {
                $scope.displayLimit[entityName] = $scope.displayLimit.default[entityName];
            };
        }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/display-by/display-by.html',
        controller: controller,
        link: link
    };
});
