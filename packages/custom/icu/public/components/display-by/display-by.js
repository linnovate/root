'use strict';

angular.module('mean.icu.ui.displayby', [])
.directive('icuDisplayBy', function() {
    function controller($scope, $state, context, $stateParams, $window) {
        $scope.projectsList = [];
        $scope.projects.forEach(function(project) {
                   if(project.title)
                     $scope.projectsList.push(project);
                });

        $scope.officesList = [];
        $scope.offices.forEach(function(office) {
            if(office.title)
                $scope.officesList.push(office);
            });

        $scope.foldersList = [];
        $scope.folders.forEach(function(folder) {
            if(folder.title)
                $scope.foldersList.push(folder);
            });
        
        $scope.officeDocumentsList = [];
        $scope.officeDocuments.forEach(function(officeDocument) {
            if(officeDocument.title)
               $scope.officeDocumentsList.push(officeDocument);
            });

        if($scope.officesList.length > 0)
        {
            $scope.officesList.office = $scope.officesList[0];
        }

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

        //$scope.temp = {};
        $scope.changeOrder = function () {
            //$scope.temp.office = $scope.officesList.office;

            // if($scope.officesList.office.title != "custom"){
            //     $scope.sorting.isReverse = !$scope.sorting.isReverse;
            // }
            
            /*Made By OHAD - Needed for reversing sort*/
            //$state.go($state.current.name, { sort: $scope.officesList.office.title });
        };
        
        $scope.typesList = [{
            name: 'new',
             color:'ff4081'
        },{
            name:  'received',
            color:'37afef' 
        }
        //,{
        //    name:  'in-progress',
        //    color:'757575'
        //}
        ,{
            name:  'sent',
            color:'FFCC33'
        },{
            name:  'done',
            color:'757575'
        }];

        $scope.typeSelected = '';

        $scope.singularItemName = {
            discussions: "discussion",
            projects: "project",
            tasks: "task",
            officeDocuments: "officeDocument",
            offices: "office",
            folders: "folder"
        };

        $scope.allItems = {
            projects: $scope.projects,
            discussions: $scope.discussions,
            tasks: $scope.tasks,
            officeDocuments: $scope.officeDocuments,
            offices: $scope.offices,
            folders: $scope.folders
        };

        // Reverse list in sideline
        $scope.projectsList = $scope.projectsList.slice();
        $scope.projectsList.reverse();
        $scope.allItems.projects = $scope.allItems.projects.slice();
        $scope.allItems.projects.reverse();
        $scope.allItems.discussions = $scope.allItems.discussions.slice();
        $scope.allItems.discussions.reverse();
        $scope.discussions = $scope.discussions.slice();
        $scope.discussions.reverse();

        $scope.context = context;

        $scope.displayLimit = {
            projects : 3,
            discussions : 3,
            offices: 3,
            folders: 3,
            officeDocuments:3,
            reset : function() {
                this.projects = 3;
                this.discussions = 3;
                this.offices = 3;
                this.folders = 3;
                this.officeDocuments = 3;
            }
        };

        $window.onbeforeunload = function(){
            localStorage.removeItem("type");
        };

        $scope.reset = function(main){
            localStorage.removeItem("type");
            $scope.typeSelected = null;
        };

        $scope.typeSelected = localStorage.getItem("type");

        $scope.switchToType= function(type){

            $scope.typeSelected = type.name;
            
            if(context.entityName=='folder'){
                $scope.officeDocuments = $scope.officeDocuments.filter(function(officeDocument){
                    return officeDocument.status == type.name &&officeDocument.folder&& officeDocument.folder._id==context.entityId ;
                });

            }else{

                $scope.officeDocuments = $scope.officeDocuments.filter(function(officeDocument){
                    return officeDocument.status == type.name ;
                });

            }
        
            localStorage.setItem("type", type.name);

            $state.go($state.current, {officeDocuments:$scope.officeDocuments}, {reload: true})
           
            
            // var temp=[];
            // debugger;
            // $scope.officeDocuments.forEach(function(d){
            //     temp.push(d);
            // });
            // temp = temp.filter(function(officeDocument){
            //     if(context.entityName=='folder'){
            //         return officeDocument.status == type.name &&officeDocument.folder&& officeDocument.folder._id==context.entityId ;
            //     }
            //     else{
            //         return officeDocument.status == type.name;
            //     }      
            // });
            // if(temp.length==0){
            //     $state.go('main.' + context.main + '.all', {'officeDocuments':undefined},{reload: true});
            // }
            // else{
            //     $state.go($state.current,{'officeDocuments':temp});
                
            // }

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
        $scope.switchTo = function(entityName, id) {

            // If we are switching between entities, then shrink the display limit again
            if (!$scope.visible[entityName]) {
                displayLimit.reset();
            }
            $state.go('main.' + context.main  +  '.byentity', {
                entity: entityName,
                entityId: id,
                officeDocuments:undefined
            });
        };
        $scope.switchToAll = function (entityName, id) {
            $state.go('main.' + context.main + '.all.details.activities', {
                id: id,
                entity: entityName,
            });
        }

        $scope.visible = {
            project: false,
            discussion: false,
            user: false,
            officeDocument: false,
            office: false,
            folder: false
        };

        $scope.visible[$scope.context.entityName] = true;

        $scope.GoToOffices = function() {
            $state.go('main.offices.all');
        }

        $scope.GoToTemplateDocs = function() {
            $state.go('main.templateDocs.all');
        }

        $scope.GoToAdminSettings = function() {
            $state.go('main.adminSettings');
        }
    }

        function link($scope, $element, context) {
            $scope.showMore = function(limit, entityName) {
                if (($scope.displayLimit[entityName] + 3) >= limit) {
                    $scope.displayLimit[entityName] = limit;
                } else {
                    $scope.displayLimit[entityName]  += 3;

                }
            };

            $scope.collapse = function(entityName) {
                $scope.displayLimit[entityName] = 3;
            };
        }

    return {
        restrict: 'A',
        scope: {
            projects: '=',
            discussions: '=',
            people: '=',
            icuDisplayBy: '=',
            officeDocuments: '=',
            offices: '=',
            folders: '=',
            me: '='
        },
        templateUrl: '/icu/components/display-by/display-by.html',
        controller: controller,
        link: link
    };
});
