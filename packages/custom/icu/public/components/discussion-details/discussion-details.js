'use strict';

angular.module('mean.icu.ui.discussiondetails', [])
    .controller('DiscussionDetailsController', function ($scope,
                                                         entity,
                                                         tasks,
                                                         context,
                                                         $state,
                                                         $timeout,
                                                         people,
                                                         DiscussionsService,
                                                         $stateParams) {
        $scope.isLoading = true;
        $scope.discussion = entity || context.entity;
        $scope.tasks = tasks.data || tasks;
        $scope.shouldAutofocus = !$stateParams.nameFocused;
        $scope.people = people.data || people;
        $scope.main = context.main;
        
        if($scope.people[Object.keys($scope.people).length-1].name !== 'no select'){
            var newPeople = {
                name: 'no select'
            };

            $scope.people.push(_(newPeople).clone());
        }
        DiscussionsService.getStarred().then(function(starred) {
            $scope.discussion.star = _(starred).any(function(s) {
                return s._id === $scope.discussion._id;
            });
        });

        var errors = {
    		'assign': 'please select assignee!',
    		'due': 'please choose deadline!',
    		'title': 'please fill title!'
    	};

        $scope.summary = function (discussion) {
        	for (var key in errors) {
        		if (!discussion[key]) {
        			alert(errors[key]);
        			return
        		}
        	};
            DiscussionsService.summary(discussion).then(function (result) {
                discussion.status = result.status;
                var index = $state.current.name.indexOf('main.search');
                $state.reload(index === 0 ? 'main.search' : 'main.tasks.byentity');
            });
        };

        $scope.schedule = function (discussion) {
            DiscussionsService.schedule(discussion).then(function (result) {
                discussion.status = result.status;
            });
        };

        $scope.archive = function (discussion) {
            discussion.status = 'archived';
            DiscussionsService.update(discussion);
        };

        $scope.statuses = ['new', 'scheduled', 'done', 'canceled', 'archived'];

        var scheduleAction = {
            label: 'scheduleDiscussion',
            method: $scope.schedule
        };

        var summaryAction = {
            label: 'sendSummary',
            method: $scope.summary
        };

        var archiveAction = {
            label: 'archiveDiscussion',
            method: $scope.archive
        };

        $scope.statusesActionsMap = {
            new: scheduleAction,
            scheduled: summaryAction,
            done: archiveAction,
            cancelled: scheduleAction
        };

        $scope.$watchGroup(['discussion.description', 'discussion.title'], function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.discussion);
            }
        });

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.discussion);
                //document.getElementById('ui-datepicker-div').style.display = 'none';
                $scope.open();
            },
            onClose: function() {
                if ($scope.checkDate()){
                    document.getElementById('ui-datepicker-div').style.display = 'block';
                    $scope.open();    
                }else{
                    document.getElementById('ui-datepicker-div').style.display = 'none';
                    $scope.open();
                }
            },
            dateFormat: 'd.m.yy'
        };

        $scope.checkDate = function() {
            var d = new Date()
            d.setHours(0,0,0,0);
            if (d > $scope.discussion.due) {
                return true;
            }
            return false;
        };

        $scope.open = function() {
            if ($scope.checkDate()) {
                document.getElementById('past').style.display = document.getElementById('ui-datepicker-div').style.display;
                document.getElementById('past').style.left = document.getElementById('ui-datepicker-div').style.left;
            } else {
                document.getElementById('past').style.display = 'none';
            }
        };

        $scope.closeOldDateNotification = function(){
            document.getElementById('past').style.display = 'none';
        }

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        function navigateToDetails(discussion) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.discussions.all.details' : 'main.discussions.byentity.details';

            $state.go($scope.detailsState, {
                id: discussion._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (discussion) {
            DiscussionsService.star(discussion).then(function () {
                navigateToDetails(discussion);
            });
        };

        $scope.deleteDiscussion = function (discussion) {
            DiscussionsService.remove(discussion._id).then(function () {

                $state.go('main.discussions.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        $scope.update = function (discussion) {
            DiscussionsService.update(discussion);
        };

        $scope.updateCurrentDiscussion= function(){
            DiscussionsService.currentDiscussionName = $scope.discussion.title;
        }


        $timeout(function() {
            $scope.isLoading = false;
        }, 0);

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if (
            $scope.discussion && (
            $state.current.name === 'main.tasks.byentity.details' ||
            $state.current.name === 'main.search.discussion' ||
            $state.current.name === 'main.discussions.all.details' ||
            $state.current.name === 'main.discussions.byentity.details')) {
            $state.go('.activities');
        }

    });
