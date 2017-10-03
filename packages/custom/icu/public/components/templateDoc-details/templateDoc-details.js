'use strict';

angular.module('mean.icu.ui.templateDocdetails', [])
    .controller('TemplateDocDetailsController', function ($scope,
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

        $scope.update = function (templateDoc, context) {
            TemplateDocsService.update(templateDoc, context).then(function(res) {
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
