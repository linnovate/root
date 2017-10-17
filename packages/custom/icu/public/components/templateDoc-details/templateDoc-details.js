'use strict';

angular.module('mean.icu.ui.templateDocdetails', [])
    .controller('TemplateDocDetailsController', function ($scope,$http,
                                                      entity,
                                                      tasks,
                                                      folders,
                                                      people,
                                                      templateDocs,
                                                      context,
                                                      $state,
                                                      TemplateDocsService,
                                                      $stateParams) {
        if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("templateDocs")))
        {
            $scope.templateDoc = entity || context.entity;
        }
        else
        {
            $scope.templateDoc = context.entity || entity;
        }
        $scope.tasks = tasks.data || tasks;
        $scope.folders = folders.data || folders;
        $scope.templateDocs = templateDocs.data || templateDocs;
        $scope.shouldAutofocus = !$stateParams.nameFocused;
/** 
        TemplateDocsService.getStarred().then(function (starred) {

            // Chack if HI room created and so needs to show HI.png
            if($scope.templateDoc.WantRoom == true)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
            }

            $scope.templateDoc.star = _(starred).any(function (s) {
                return s._id === $scope.templateDoc._id;
            });
        });
        */

        if (!$scope.templateDoc) {
            $state.go('main.templateDocs.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

        $scope.$watchGroup(['templateDoc.description', 'templateDoc.title'], function (nVal, oVal, scope) {
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
                $scope.delayedUpdate($scope.templateDoc, newContext);
            }
        });

        $scope.$watch('templateDoc.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'color',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.update($scope.templateDoc, context);
            }
        });

        $scope.people = people.data || people;

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.templateDoc, 'due');
            },
            dateFormat: 'd.m.yy'
        };

        function navigateToDetails(templateDoc) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.templateDocs.all.details' : 'main.templateDocs.byentity.details';

            $state.go($scope.detailsState, {
                id: templateDoc._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (templateDoc) {
            TemplateDocsService.star(templateDoc).then(function () {
                navigateToDetails(templateDoc);
            });
        };

        $scope.WantToCreateRoom = function (templateDoc) {

            if($scope.templateDoc.WantRoom == false)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');

                templateDoc.WantRoom = true;

                $scope.update(templateDoc, context);

                TemplateDocsService.WantToCreateRoom(templateDoc).then(function () {
                    navigateToDetails(templateDoc);
                });
            }
        };

        $scope.deleteTemplateDoc = function (templateDoc) {
            TemplateDocsService.remove(templateDoc._id).then(function () {

                $state.go('main.templateDocs.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        $scope.updateTitle = function(templateDoc,title){
            var json ={
                'name':'title',
                'newVal':title
            };
            TemplateDocsService.updateTemplateDoc(templateDoc._id,json);
        };

        $scope.updateDescription = function(templateDoc,desc){
            var json ={
                'name':'description',
                'newVal':desc
            };
            TemplateDocsService.updateTemplateDoc(templateDoc._id,json);
        };

        $scope.updateOfficeName = function(x, y) {
            $scope.officeName = $('.ui-select-search.ng-valid-parse').val()
        }

        $scope.unsetOffice = function(event, folder) {
            event.stopPropagation();
            delete folder.office;
            $scope.updateOffice($scope.templateDoc,undefined);
        };

        $scope.removeCreateNew = function() {
            $scope.officeName = '';
        }


        $scope.updateOffice = function(templateDoc,officeId) {
            var json ={
                'name':'office',
                'newVal':officeId
            };
            TemplateDocsService.updateTemplateDoc(templateDoc._id,json);
        };
/** 
        $scope.update = function (templateDoc, context) {
            TemplateDocsService.update(templateDocId, context).then(function(res) {
                if (TemplateDocsService.selected && res._id === TemplateDocsService.selected._id) {
                    if (context.name === 'title') {
                        TemplateDocsService.selected.title = res.title;
                    }
                    if (context.name === 'color') {
                        TemplateDocsService.selected.color = res.color;
                    }
                }
            });
        };
        */

        $scope.view = function(document1) {
            // Check if need to view as pdf
            if ((document1.templateType == "docx") ||
                (document1.templateType == "doc") ||
                (document1.templateType == "xlsx") ||
                (document1.templateType == "xls") ||
                (document1.templateType == "ppt") ||
                (document1.templateType == "pptx")) {
                var arr = document1.path.split("." + document1.templateType);
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
                    $.post('/templateDocsAppend.js', document1).done(function(document2) {
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

        $scope.upload = function(file) {
            $scope.test = file;
            var data = {
                'id':$stateParams.id,
                'officeId':$stateParams.entityId
            };
            if(file.length > 0){
                TemplateDocsService.uploadTemplate(data, file).then(function(result){
                    console.dir("===Template===");
                    console.dir(result);
                    $scope.templateDocs.push(result.data);
                });
            }
        };

        $scope.updateCurrentTemplateDoc = function(){
            $scope.templateDoc.PartTitle = $scope.templateDoc.title;
            TemplateDocsService.currentTemplateDocName = $scope.templateDoc.title;
        }

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.templateDoc &&
            ($state.current.name === 'main.templateDocs.all.details' ||
            $state.current.name === 'main.search.templateDoc' ||
            $state.current.name === 'main.templateDocs.byentity.details')) {
            $state.go('.activities');
        }
    });
