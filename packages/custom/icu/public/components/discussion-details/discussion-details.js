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
        $scope.CanceledMailSend = false;
        $scope.fade = false;

        if($scope.discussion.startDate){
            $scope.discussion.startDate = new Date($scope.discussion.startDate);
        }
        if($scope.discussion.endDate){
            $scope.discussion.endDate = new Date($scope.discussion.endDate);
        }
        if($scope.discussion.startTime){
            $scope.discussion.startTime = new Date($scope.discussion.startTime);
        }
        if($scope.discussion.endTime){
            $scope.discussion.endTime = new Date($scope.discussion.endTime);
        }       

        $(document).ready(function() {
            $('uib-timepicker').datepicker();
                    if($scope.discussion.allDay){
                document.getElementById('dueDiv').style.height = '96px';
            }
            else{
                document.getElementById('dueDiv').style.height = '370px';
            }
    });

        $(document).click(function(event) { 
            if( (!$(event.target).closest('.dueDiv').length) && (!$(event.target).closest('.due').length)) {
                if($scope.fade){
                    $scope.dueClicked();
                }
        }
    });   
        
        if($scope.people[Object.keys($scope.people).length-1].name !== 'no select'){
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
        
        DiscussionsService.getStarred().then(function(starred) {
            $scope.discussion.star = _(starred).any(function(s) {
                return s._id === $scope.discussion._id;
            });
        });

        var errors = {
            'assign': 'please select assignee!',
            'startDate': 'please choose deadline!',
            'title': 'please fill title!',
            'location':'please fill location'
        };

        $scope.summary = function (discussion) {
            for (var key in errors) {
                if (!discussion[key]) {
                    alert(errors[key]);
                    return
                }
            };

            if(!(discussion.allDay || (discussion.startTime&&discussion.endDate&&discussion.endTime))){
                alert("Dates problem");
                return;
            }

            DiscussionsService.summary(discussion).then(function (result) {
                discussion.status = result.status;
                var index = $state.current.name.indexOf('main.search');
                $state.reload(index === 0 ? 'main.search' : 'main.tasks.byentity');
            });
        };

        $scope.dueClicked = function () {
            $scope.showDue = true;
        };
        $scope.dueBlur = function () {
            $scope.showDue = false;
        };

        $scope.schedule = function (discussion) {
            DiscussionsService.schedule(discussion).then(function (result) {
                discussion.status = result.status;
            });
        };

        $scope.cancele = function (discussion) {
            DiscussionsService.cancele(discussion).then(function (result) {
                discussion.status = result.status;
                $scope.CanceledMailSend = true;
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

        var canceleAction = {
            label: 'canceleDiscussion',
            method: $scope.cancele
        };

        $scope.statusesActionsMap = {
            new: scheduleAction,
            scheduled: summaryAction,
            done: archiveAction,
            canceled: canceleAction
        };

        $scope.$watchGroup(['discussion.description', 'discussion.title'], function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.discussion);
            }
        });

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.discussion);
                $scope.open();
            },
            onClose: function() {
                if (!$scope.checkDate()){
                    document.getElementById('ui-datepicker-div').style.display = 'block';
                    $scope.open();    
                }else{
                    document.getElementById('ui-datepicker-div').style.display = 'none';
                    $scope.open();
                }
            },
            dateFormat: 'd.m.yy'
        };

        $scope.timeOptions ={
            minuteStep: 5,
            showInputs: false,
            disableFocus: true,
            showMeridian: false,
            defaultTime: '00:00'
        };

        $scope.checkDate = function() {
            var d = new Date()
            d.setHours(0,0,0,0);
             if (d > $scope.discussion.startDate || d > $scope.discussion.endDate || 
                $scope.discussion.endDate < $scope.discussion.startDate) {
                return false;
            }
            return true;
        };

        $scope.disableButton = function(){
            if(!$scope.discussion.location){
                return true;
            }
            if($scope.discussion.startDate && $scope.discussion.allDay){
                    return false;
                }
                else if($scope.discussion.startDate && $scope.discussion.startTime && 
                    $scope.discussion.endDate && $scope.discussion.endTime){
                    return false;
                }
                else{
                    return true;
                }
        }

        $scope.checkboxClick = function(discussion){
            $scope.update(discussion);
            if($scope.discussion.allDay){
                document.getElementById('dueDiv').style.height = '96px';
                console.log("YES");
            }
            else{
                document.getElementById('dueDiv').style.height = '370px';
                console.log("NO");
            }
        }

        $scope.open = function() {
            var d = new Date();
            if (d > $scope.discussion.startDate || d > $scope.discussion.endDate) {
                document.getElementById('before').style.display = 'none';
                document.getElementById('past').style.display = document.getElementById('ui-datepicker-div').style.display;
                document.getElementById('past').style.left = document.getElementById('ui-datepicker-div').style.left;
            } 
            else if($scope.discussion.endDate < $scope.discussion.startDate){
                document.getElementById('past').style.display = 'none';
                document.getElementById('before').style.display = document.getElementById('ui-datepicker-div').style.display;
                document.getElementById('before').style.left = document.getElementById('ui-datepicker-div').style.left;
            }
            else {
                document.getElementById('past').style.display = 'none';
                document.getElementById('before').style.display = 'none';
            }
        };

        $scope.dueClicked= function() {
            console.log("yes");
            if(!$scope.fade){
                $('.dueDiv').fadeIn(1000);
            }
            else{
               $('.dueDiv').fadeOut(1000); 
            }
            $scope.fade = !$scope.fade;
        };

        $scope.closeOldDateNotification = function(){
            document.getElementById('past').style.display = 'none';
        }
        $scope.closeBefore = function(){
            document.getElementById('before').style.display = 'none';
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
            console.log("dates:")
            console.log($scope.discussion.startDate);
            console.log($scope.discussion.endDate);
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
