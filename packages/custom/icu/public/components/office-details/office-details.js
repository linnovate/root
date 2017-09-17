'use strict';

angular.module('mean.icu.ui.officedetails', [])
    .controller('OfficeDetailsController', function ($scope,
                                                      entity,
                                                      tasks,
                                                      folders,
                                                      people,
                                                      offices,
                                                      context,
                                                      $state,
                                                      OfficesService,
                                                      $stateParams) {
        if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("offices")))
        {
            $scope.office = entity || context.entity;
        }
        else
        {
            $scope.office = context.entity || entity;
        }
        $scope.tasks = tasks.data || tasks;
        $scope.folders = folders.data || folders;
        $scope.offices = offices.data || offices;
        $scope.shouldAutofocus = !$stateParams.nameFocused;

        OfficesService.getStarred().then(function (starred) {

            // Chack if HI room created and so needs to show HI.png
            if($scope.office.WantRoom == true)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
            }

            $scope.office.star = _(starred).any(function (s) {
                return s._id === $scope.office._id;
            });
        });

        if (!$scope.office) {
            $state.go('main.offices.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

        $scope.$watchGroup(['office.description', 'office.title'], function (nVal, oVal, scope) {
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
                $scope.delayedUpdate($scope.office, newContext);
            }
        });

        $scope.$watch('office.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'color',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.update($scope.office, context);
            }
        });

        $scope.people = people.data || people;

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.office, 'due');
            },
            dateFormat: 'd.m.yy'
        };

        function navigateToDetails(office) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.offices.all.details' : 'main.offices.byentity.details';

            $state.go($scope.detailsState, {
                id: office._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (office) {
            OfficesService.star(office).then(function () {
                navigateToDetails(office);
            });
        };

        $scope.WantToCreateRoom = function (office) {

            if($scope.office.WantRoom == false)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');

                office.WantRoom = true;

                $scope.update(office, context);

                OfficesService.WantToCreateRoom(office).then(function () {
                    navigateToDetails(office);
                });
            }
        };

        $scope.deleteOffice = function (office) {
            OfficesService.remove(office._id).then(function () {

                $state.go('main.offices.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        $scope.update = function (office, context) {
            OfficesService.update(office, context).then(function(res) {
                if (OfficesService.selected && res._id === OfficesService.selected._id) {
                    if (context.name === 'title') {
                        OfficesService.selected.title = res.title;
                    }
                    if (context.name === 'color') {
                        OfficesService.selected.color = res.color;
                    }
                }
            });
        };

        $scope.updateCurrentOffice = function(){
            $scope.office.PartTitle = $scope.office.title;
            OfficesService.currentOfficeName = $scope.office.title;
        }

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.office &&
            ($state.current.name === 'main.offices.all.details' ||
            $state.current.name === 'main.search.office' ||
            $state.current.name === 'main.offices.byentity.details')) {
            $state.go('.activities');
        }
    });
