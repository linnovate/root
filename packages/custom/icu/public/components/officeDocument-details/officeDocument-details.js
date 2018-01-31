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
                                                      SignaturesService,
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

        if($scope.officeDocument.folder && $scope.officeDocument.folder.office){
            SignaturesService.getByOfficeId( $scope.officeDocument.folder.office)
            .then(function (result) {
                $scope.signatures = result;
            
            })
        }

        $scope.selectedSignature;

        $scope.SignatureSelected = function (signature) {
            $scope.selectedSignature = signature;
        }

        $scope.Sign = function () {
            console.log($scope.selectedSignature)
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

        $scope.statuses = ['new', 'in-progress', 'received', 'sent', 'done'];



        $scope.$watch('officeDocument.title', function(nVal, oVal) {
            if (nVal !== oVal && oVal) {
                var newContext = {
                    name: 'title',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'renamed'
                };
                $scope.delayedUpdate($scope.officeDocument, newContext);
            }
        });

        var nText, oText;
        $scope.$watch('officeDocument.description', function(nVal, oVal) {
            nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            if (nText != oText && oText) {
                var newContext = {
                    name: 'description',
                    oldVal: oVal,
                    newVal: nVal,
                };
                $scope.delayedUpdate($scope.officeDocument, newContext);
            }
        });

        $scope.addSerialTitle = function(document1){
            $scope.settingSerial = true;
            OfficeDocumentsService.addSerialTitle(document1).then(function(result){
                $scope.settingSerial = false;                
                if(result && result.spPath){
                    document1.spPath = result.spPath;
                }
                if(result && result.serial){
                    document1.serial = result.serial;
                }
            });
        }

        $scope.signOnDocx = function(document1){
            //if(document1.spPath){
            OfficeDocumentsService.signOnDocx(document1,$scope.selectedSignature).then(function(result){              
                if(result && result.spPath){
                    document1.spPath = result.spPath;
                }
            });
       // }
        }

        $scope.sendDocument = function(document1){
            console.log("HEY");
            console.dir(document1);
        }

        $scope.uploadEmpty = function(document1){
            OfficeDocumentsService.uploadEmpty(document1).then(function(result){
                $state.reload();
            });
        }

        $scope.view = function(document1) {
            console.dir(document1);
            if(document1.spPath){
                var spSite = document1.spPath.substring(0,document1.spPath.indexOf('ICU')+3);
                console.log("SPSITE:");
                console.log(spSite);
                var uri = spSite+"/_layouts/15/WopiFrame.aspx?sourcedoc="+document1.spPath+"&action=default";
                console.log("URI:");
                console.log(uri);
                 window.open(uri,'_blank');
            }
            else{
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
                console.log("ToHref");
                console.log(ToHref);
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
            if(file.length>0){
                $scope.uploading = true;
            }
            $scope.test = file;
            var data = {
                'id':$stateParams.id,
                'folderId':$stateParams.entityId
            };
            if(file.length > 0){
                OfficeDocumentsService.uploadFileToDocument(data, file).then(function(result){
                    $scope.uploading = false;
                    $scope.officeDocument.title = result.data.title;
                    $scope.officeDocument.path = result.data.path;
                    $scope.officeDocument.spPath = result.data.spPath;
                    $scope.officeDocument.documentType = result.data.documentType;

                },function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
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

        $scope.deleteDocumentFile = function(officeDocument){
            OfficeDocumentsService.deleteDocumentFile(officeDocument._id).then(function(){
                officeDocument.path = undefined;
                officeDocument.spPath = undefined;
            });
        };

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
                'newVal':folderId,
            };
            officeDocument.watchers = officeDocument.folder.watchers.concat(officeDocument.watchers);
            officeDocument.watchers = _.map(_.groupBy(officeDocument.watchers,function(doc){
                return doc._id || doc;
            }),function(grouped){
                return grouped[0];
            });
            json.watchers = officeDocument.watchers;
            OfficeDocumentsService.updateDocument(officeDocument._id,json).then(function(res) {
                OfficeDocumentsService.updateEntity(officeDocument, backupEntity).then(function(result) {
                    backupEntity = JSON.parse(JSON.stringify($scope.officeDocument));
                    ActivitiesService.data = ActivitiesService.data || [] ;
                    ActivitiesService.data.push(result);
                });
            });
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
                        ActivitiesService.data = ActivitiesService.data || [] ;
                        ActivitiesService.data.push(result);
                    });
                    break;
                case 'status':
                    OfficeDocumentsService.updateStatus(officeDocument, backupEntity).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.officeDocument));
                        ActivitiesService.data = ActivitiesService.data || [] ;
                        ActivitiesService.data.push(result);
                    });
                    break; 
                case 'title':
                case 'description':
                    OfficeDocumentsService.updateTitle(officeDocument, backupEntity, context.name).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.officeDocument));
                        ActivitiesService.data = ActivitiesService.data || [];
                        ActivitiesService.data.push(result);
                    });
                    break; 
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

        $scope.delayedUpdate = _.debounce($scope.update, 2000);

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
