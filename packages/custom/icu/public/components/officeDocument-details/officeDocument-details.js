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
                                                      $stateParams) {
        if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("officeDocuments")))
        {
            $scope.officeDocument = entity || context.entity;
        }
        else
        {
            $scope.officeDocument = context.entity || entity;
        }
        $scope.tasks = tasks.data || tasks;
        $scope.officeDocuments = officeDocuments.data || officeDocuments;
        $scope.shouldAutofocus = !$stateParams.nameFocused;

        OfficeDocumentsService.getStarred().then(function (starred) {

            // Chack if HI room created and so needs to show HI.png
            if($scope.officeDocument.WantRoom == true)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
            }

            $scope.officeDocument.star = _(starred).any(function (s) {
                return s._id === $scope.officeDocument._id;
            });
        });

        if (!$scope.officeDocument) {
            $state.go('main.officeDocuments.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

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
                $scope.update($scope.officeDocument, 'due');
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

        $scope.WantToCreateRoom = function (officeDocument) {

            if($scope.officeDocument.WantRoom == false)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');

                officeDocument.WantRoom = true;

                $scope.update(officeDocument, context);

                OfficeDocumentsService.WantToCreateRoom(officeDocument).then(function () {
                    navigateToDetails(officeDocument);
                });
            }
        };

        $scope.deleteOfficeDocument = function (officeDocument) {
            OfficeDocumentsService.remove(officeDocument._id).then(function () {

                $state.go('main.officeDocuments.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        $scope.update = function (officeDocument, context) {
            OfficeDocumentsService.update(officeDocument, context).then(function(res) {
                if (OfficeDocumentsService.selected && res._id === OfficeDocumentsService.selected._id) {
                    if (context.name === 'title') {
                        OfficeDocumentsService.selected.title = res.title;
                    }
                    if (context.name === 'color') {
                        OfficeDocumentsService.selected.color = res.color;
                    }
                }
            });
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
    });
