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
                                                      $stateParams,
                                                      ActivitiesService) {
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

        // backup for previous changes - for updates
        var backupEntity = JSON.parse(JSON.stringify($scope.office));

        if (!$scope.office) {
            $state.go('main.offices.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

        $scope.$watch('office.title', function(nVal, oVal) {
            if (nVal !== oVal && oVal) {
                var newContext = {
                    name: 'title',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'renamed'
                };
                $scope.delayedUpdate($scope.office, newContext);
            }
        });

        var nText, oText;
        $scope.$watch('office.description', function(nVal, oVal) {
            nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            if (nText != oText && oText) {
                var newContext = {
                    name: 'description',
                    oldVal: oVal,
                    newVal: nVal
                };
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

        $scope.$watch('office.tel', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'tel',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.delayedUpdate($scope.office, context);
            }
        });

        $scope.$watch('office.unit', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'unit',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.delayedUpdate($scope.office, context);
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

                switch(context.name) {
                    case 'color':
                        OfficesService.updateColor(office).then(function(result) {
                            ActivitiesService.data = ActivitiesService.data || [] ;
                            ActivitiesService.data.push(result);
                        });
                    case 'title':
                    case 'description':
                        OfficesService.updateTitle(office, backupEntity, context.name).then(function(result) {
                            backupEntity = JSON.parse(JSON.stringify($scope.office));
                            ActivitiesService.data = ActivitiesService.data || [];
                            ActivitiesService.data.push(result);

                        });
                        case 'tel':
                        case 'unit':
                            OfficesService.updateTitle(office, backupEntity, context.name).then(function(result) {
                                backupEntity = JSON.parse(JSON.stringify($scope.office));
                                // ActivitiesService.data = ActivitiesService.data || [];
                                // ActivitiesService.data.push(result);
    
                            });
                        break; 
                }
                
            });
        };

        $scope.updateCurrentOffice = function(){
            $scope.office.PartTitle = $scope.office.title;
            OfficesService.currentOfficeName = $scope.office.title;
        }

        $scope.delayedUpdate = _.debounce($scope.update, 2000);

        if ($scope.office &&
            ($state.current.name === 'main.offices.all.details' ||
            $state.current.name === 'main.search.office' ||
            $state.current.name === 'main.offices.byentity.details')) {
            $state.go('.activities');
        }
    });
