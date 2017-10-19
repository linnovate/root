'use strict';

angular.module('mean.icu.ui.officeDocumentdetails', [])
    .controller('OfficeDocumentDetailsController', function ($scope,
                                                      entity,
                                                      tasks,
                                                      people,
                                                      officeDocuments,
                                                      context,
                                                      $state,
                                                      OfficeDocumentsService,
                                                      ActivitiesService, 
                                                      $stateParams,
                                                    $timeout,$http) {
        if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("officeDocuments")))
        {
            $scope.officeDocument = entity || context.entity;
        }
        else
        {
            $scope.officeDocument = context.entity || entity;
        }

        $scope.tags = ['tag'];
        $scope.tasks = tasks.data || tasks;
        $scope.officeDocuments = officeDocuments.data || officeDocuments;
        $scope.shouldAutofocus = !$stateParams.nameFocused;
        $scope.tagInputVisible = false;
        
        
        //$scope.officeDocument.created = new Date($scope.officeDocument.created);
        
        
        OfficeDocumentsService.getStarred().then(function (starred) {

            // // Chack if HI room created and so needs to show HI.png
            // if($scope.officeDocument.WantRoom == true)
            // {
            //     $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
            // }

            $scope.officeDocument.star = _(starred).any(function (s) {
                return s._id === $scope.officeDocument._id;
            });
        });

        // backup for previous changes - for updates
        var backupEntity = JSON.parse(JSON.stringify($scope.officeDocument));

        if (!$scope.officeDocument) {
            $state.go('main.officeDocuments.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }
        
        $scope.people = people.data || people;
        if ($scope.people[Object.keys($scope.people).length - 1].name !== 'no select') {
            var newPeople = {
                name: 'no select'
            };

            $scope.people.push(_(newPeople).clone());
        }
         for(var i =0 ; i<$scope.people.length;i++){
                    if($scope.people[i] && ($scope.people[i].job == undefined || $scope.people[i].job==null)){
                        $scope.people[i].job = $scope.people[i].name;
                    }
        }


        $scope.statuses = ['new', 'in-progress', 'received', 'done'];

        $scope.$watchGroup(['officeDocument.description', 'officeDocument.title'], function (nVal, oVal, scope) {
            if (nVal !== oVal && oVal) {
                var newContext;
                if (nVal[1] !== oVal[1]) {
                    newContext = {
                        name: 'title',
                        oldVal: oVal[1],
                        newVal: nVal[1],
                        action: 'renamed'
                    };
                } else {
                    newContext = {
                        name: 'description',
                        oldVal: oVal[0],
                        newVal: nVal[0]
                    };
                }
                $scope.delayedUpdate($scope.officeDocument, newContext);
            }
        });


        $scope.view = function(document1) {
            // Check if need to view as pdf
            if ((document1.documentType == "docx") ||
                (document1.documentType == "doc") ||
                (document1.documentType == "xlsx") ||
                (document1.documentType == "xls") ||
                (document1.documentType == "ppt") ||
                (document1.documentType == "pptx")) {
                var arr = document1.path.split("." + document1.documentType);
                var ToHref = arr[0] + ".pdf";
                // Check if convert file exists allready
                $http({
                    url: ToHref.replace('/files/', '/api/files/'),
                    method: 'HEAD'
                }).success(function() {
                    // There is allready the convert file
                    window.open(ToHref + '?view=true')
                }).error(function() {
                    // Send to server
                    $.post('/officeDocsAppend.js', document1).done(function(document2) {
                        // The convert is OK and now we open the pdf to the client in new window
                        window.open(ToHref + '?view=true');
                    }).fail(function(xhr) {
                        console.error(xhr.responseText);
                    });
                });
            }
            // Format is NOT needed to view as pdf
            else {
                window.open(document1.path + '?view=true');
            }
        };


        $scope.getUnusedTags = function() {
            // return _.chain($scope.tags).reject(function(t) {
            //     return $scope.task.tags.indexOf(t.term) >= 0;
            // }).sortBy(function(a, b) {
            //     return b.count - a.count;
            // }).pluck('term').value();

            return $scope.tags.filter(function(x) { return $scope.officeDocument.tags.indexOf(x) < 0 })
        };
        

        $scope.upload = function(file) {
            $scope.test = file;
            var data = {
                'id':$stateParams.id,
                'folderId':$stateParams.entityId
            };
            if(file.length > 0){
                OfficeDocumentsService.uploadFileToDocument(data, file).then(function(result){
                    console.dir("===Document===");
                    console.dir(result);
                    $scope.officeDocuments.push(result.data);
                });
            }
        };


        $scope.addTagClicked=function(){
        	$scope.setFocusToTagSelect();
        	$scope.tagInputVisible=true;
        }

        $scope.addTag = function(tag) {
        	if(tag!=undefined && $.inArray(tag,$scope.officeDocument.tags)==-1){
                var array = [];
                $scope.officeDocument.tags.forEach(function(t){
                    array.push(t);
                });
                $scope.officeDocument.tags.push(tag);
                var context = {
                    name: 'tags',
                    oldVal: array,
                    newVal:  $scope.officeDocument.tags,
                    action: 'changed'
                };
            	$scope.update($scope.officeDocument, context);
        	}

            $scope.tagInputVisible = false;
        };

        $scope.removeTag = function(tag) {
            var array = [];
            $scope.officeDocument.tags.forEach(function(t){
                array.push(t);
            });
            $scope.officeDocument.tags = _($scope.officeDocument.tags).without(tag);
           
            var context = {
                name: 'tags',
                oldVal: array,
                newVal: $scope.officeDocument.tags,
                action: 'changed'
            };
            $scope.update($scope.officeDocument, context);

        };

        $scope.setFocusToTagSelect = function() {
            var element = angular.element('#addTag > input.ui-select-focusser')[0];
            $timeout(function() {
                element.focus();
            }, 0);
        };

        $scope.$watch('officeDocument.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'color',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.update($scope.officeDocument, context);
            }
        });

        $scope.people = people.data || people;

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.officeDocument, {name: 'due'});
            },
            dateFormat: 'd.m.yy'
        };

        function navigateToDetails(officeDocument) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.officeDocuments.all.details' : 'main.officeDocuments.byentity.details';

            $state.go($scope.detailsState, {
                id: officeDocument._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (officeDocument) {
            OfficeDocumentsService.star(officeDocument).then(function () {
                navigateToDetails(officeDocument);
            });
        };

        $scope.deleteOfficeDocument = function (officeDocument) {
            OfficeDocumentsService.delete(officeDocument._id).then(function () {

                $state.go('main.officeDocuments.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        var reloadCurrent = function() {
            $state.go($state.current.name, {
                entity: context.entityName,
                entityId: context.entityId
            }, {reload: true});
        }

        $scope.updateAssign = function(officeDocument) {
            var json = {
                'name':'assign',
                'newVal':officeDocument.assign
            };
            OfficeDocumentsService.updateDocument(officeDocument._id,json);
            OfficeDocumentsService.updateAssign(officeDocument, backupEntity).then(function(result) {
                backupEntity = JSON.parse(JSON.stringify(officeDocument));
                ActivitiesService.data = ActivitiesService.data || [];
                ActivitiesService.data.push(result);
                reloadCurrent();
            }); 

        };


        $scope.updateFolderName = function(x, y) {
            $scope.folderName = $('.ui-select-search.ng-valid-parse').val()
        }

        $scope.unsetFolder = function(event, folder) {
            event.stopPropagation();
            delete $scope.officeDocument.folder;
            $scope.updateFolder($scope.officeDocument,undefined);
        };

        $scope.removeCreateNew = function() {
            $scope.folderName = '';
        }


        $scope.updateFolder = function(officeDocument,folderId) {
            var json ={
                'name':'folder',
                'newVal':folderId
            };
            OfficeDocumentsService.updateDocument(officeDocument._id,json);
        };


        $scope.update = function (officeDocument, context) {
            
            OfficeDocumentsService.updateDocument(officeDocument._id, context).then(function(res) {
                
            });
            ActivitiesService.data = ActivitiesService.data || [];
            let me = $scope.me;
            switch (context.name) {
                case 'due':
                    OfficeDocumentsService.updateDue(officeDocument, backupEntity).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.officeDocument));
                        ActivitiesService.data.push(result);
                        reloadCurrent();
                    });
                    break;
                case 'status':
                    OfficeDocumentsService.updateStatus(officeDocument, backupEntity).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.officeDocument));
                        ActivitiesService.data.push(result);
                        reloadCurrent();
                    });
            }
        };

        $scope.updateStatus = function(officeDoc){
            var context = {
                "name":"status",
                "newVal":$scope.officeDocument.status,
                "oldVal":officeDoc.status
            };
            
            $scope.update($scope.officeDocument, context);

        };

        $scope.updateCurrentOfficeDocument = function(){
            $scope.officeDocument.PartTitle = $scope.officeDocument.title;
            OfficeDocumentsService.currentOfficeDocumentName = $scope.officeDocument.title;
        }

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.officeDocument &&
            ($state.current.name === 'main.officeDocuments.all.details' ||
            $state.current.name === 'main.search.officeDocument' ||
            $state.current.name === 'main.officeDocuments.byentity.details')) {
            $state.go('.activities');
        }
    }).directive('selectOnBlur', function($timeout) {
        return {
            require: 'uiSelect',
            link: function(scope, elm, attrs, ctrl) {
                elm.on('blur', 'input.ui-select-search', function(e) {
                	var ngModelName = attrs.id;
                	if(ngModelName == "addTag"){
                		ctrl.select();
                		ctrl.ngModel.$setViewValue(undefined);
                		scope.tagInputVisible=false;
                	}
                });

                elm.on('blur', 'input.ui-select-focusser', function(e, g) {
                    $timeout(function() {
                        if (!e.target.hasAttribute('disabled')) {
                            scope.tagInputVisible = false;
                        }
                    }, 5);
                });

            }
        };
    }).directive('test',function(){
    	return{
    		scope:true,
    		require:'ngModel',
    		link: function($scope,$elm,$attrs,ngModel){
    			ngModel.$setViewValue('hi');
    		}
    	}
    });
