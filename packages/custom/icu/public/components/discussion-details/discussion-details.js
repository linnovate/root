'use strict';

angular.module('mean.icu.ui.discussiondetails', [])
    .controller('DiscussionDetailsController', function ($scope,
                                                         entity,
                                                         tasks,
                                                         context,
                                                         tags,
                                                         $state,
                                                         $timeout,
                                                         people,
                                                         DiscussionsService,
                                                         PermissionsService,
                                                         ActivitiesService,
                                                         EntityService,
                                                         $stateParams) {
        $scope.isLoading = true;
        $scope.tagInputVisible = false;
        if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("discussions")))
        {
            $scope.discussion = entity || context.entity;
        }
        else
        {
            $scope.discussion = context.entity || entity;
        }
        $scope.entity = entity || context.entity;
        $scope.tasks = tasks.data || tasks;
        $scope.shouldAutofocus = !$stateParams.nameFocused;
        $scope.people = people.data || people;
        $scope.main = context.main;
        $scope.CanceledMailSend = false;
        $scope.fade = false;
        $scope.tags = tags;

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
             $scope.updateDatesString();
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

        // backup for previous changes - for updates
        var backupEntity = JSON.parse(JSON.stringify($scope.discussion));

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

        $scope.isRecycled = $scope.discussion.hasOwnProperty('recycled');

        $scope.enableRecycled = true;
        $scope.havePermissions = function(type, enableRecycled){
            enableRecycled = enableRecycled || !$scope.isRecycled;
            return (PermissionsService.havePermissions($scope.entity, type) && enableRecycled);
        };

        $scope.haveEditiorsPermissions = function(){
            return PermissionsService.haveEditorsPerms($scope.entity);
        };

        $scope.permsToSee = function(){
            return PermissionsService.haveAnyPerms($scope.entity);
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



        /**
  #firstStr{
        margin-left:-20px;
    }
    #secondStr{
        margin-left:-20px;
    }
    */
        $scope.updateDatesString = function(){
            var val = $("#deleteDiscussion").html();
            var english=false;
            if(val=="מחק דיון"){
                english = false;
            }
            else{
                english=true;
            }
            if(!english){
                $("#startTime").css("orientation","auto left");
            }
            $scope.allDayTitle = english?"All day long":"כל היום";
            var margin = english?"-15px":"-35px";
            var marginAllDay = english?"-5px":"-15px";
            var marginFirst = english?"-5px":"-35px";
            $scope.firstStr = 'deadline';
            $scope.secondStr = '';
            if($scope.discussion.startDate){
                var startStr = $scope.discussion.startDate.getDate()+"/"+($scope.discussion.startDate.getMonth()+1)+"/"+$scope.discussion.startDate.getFullYear();
                $scope.firstStr = startStr;
            }
            if($scope.discussion.allDay){
                $scope.secondStr = "All day long";
                $("#secondStr").css("margin-left",marginAllDay);
                $("#firstStr").css("margin-left",marginFirst);
            }
            else{
                if($scope.discussion.startTime){
                    var ho = $scope.discussion.startTime.getHours().toString().length==1? "0"+$scope.discussion.startTime.getHours().toString():
                        $scope.discussion.startTime.getHours().toString();
                    var min = $scope.discussion.startTime.getMinutes().toString().length==1? "0"+$scope.discussion.startTime.getMinutes().toString():
                        $scope.discussion.startTime.getMinutes().toString();
                    startStr = ho+":"+min;
                    $scope.firstStr = $scope.discussion.startDate ? $scope.firstStr + " "+startStr : '';
                    if($scope.discussion.startDate){
                        $("#firstStr").css("margin-left",margin);
                    }
                }
                if($scope.discussion.endDate){
                    if($scope.firstStr!='deadline'){
                        $scope.firstStr = $scope.firstStr;
                    }
                    else{
                        $scope.firstStr = "";
                    }
                    var endStr = $scope.discussion.endDate.getDate()+"/"+($scope.discussion.endDate.getMonth()+1)+"/"+$scope.discussion.endDate.getFullYear();
                    $scope.secondStr = endStr;
                    if($scope.discussion.endTime){
                        var ho = $scope.discussion.endTime.getHours().toString().length==1? "0"+$scope.discussion.endTime.getHours().toString():
                        $scope.discussion.endTime.getHours().toString();
                        var min = $scope.discussion.endTime.getMinutes().toString().length==1? "0"+$scope.discussion.endTime.getMinutes().toString():
                        $scope.discussion.endTime.getMinutes().toString();
                        endStr = ho+":"+min;
                        $scope.secondStr = $scope.secondStr +" "+endStr;
                        $("#secondStr").css("margin-left",margin);
                    }
            }
        }
        };

        $scope.startDueOptions = {
            onSelect: function () {
                $scope.update($scope.discussion, 'due');
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
        $scope.endDueOptions = _.clone($scope.startDueOptions);

        $scope.startDueOptions.onSelect = function () {
            $scope.update($scope.discussion, 'startDue');
            $scope.open();
        },

        $scope.endDueOptions.onSelect = function () {
            $scope.update($scope.discussion, 'endDue');
            $scope.open();
        },

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
            }
            else{
                document.getElementById('dueDiv').style.height = '370px';
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

        $scope.getUnusedTags = function() {

            return $scope.tags.filter(function(x) { return $scope.discussion.tags.indexOf(x) < 0 })
        };

        $scope.addTagClicked=function(){
        	$scope.setFocusToTagSelect();
        	$scope.tagInputVisible=true;
        }

        $scope.addTag = function(tag) {
        	if(tag!=undefined && $.inArray(tag,$scope.discussion.tags)==-1){
        		$scope.discussion.tags.push(tag);
            	$scope.update($scope.discussion);
        	}

            $scope.tagInputVisible = false;
        };

        $scope.removeTag = function(tag) {
            $scope.discussion.tags = _($scope.discussion.tags).without(tag);
            $scope.update($scope.discussion);
        };

        $scope.setFocusToTagSelect = function() {
            var element = angular.element('#addTag > input.ui-select-focusser')[0];
            $timeout(function() {
                element.focus();
            }, 0);
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


        $scope.recycle = function(entity) {
            console.log("$scope.recycle") ;
            EntityService.recycle('discussions', entity._id).then(function() {
                let clonedEntity = JSON.parse(JSON.stringify(entity));
                clonedEntity.status = "Recycled" // just for activity status
                DiscussionsService.updateStatus(clonedEntity, entity).then(function(result) {
                    ActivitiesService.data.push(result);
                });

                $state.go('main.discussions.all', {
                    entity: 'all'
                }, {reload: true});

            });
        };

        $scope.recycleRestore = function(entity) {
            console.log("$scope.recycleRestore") ;
            EntityService.recycleRestore('discussions', entity._id).then(function() {
                let clonedEntity = JSON.parse(JSON.stringify(entity));
                clonedEntity.status = "un-deleted" // just for activity status
                DiscussionsService.updateStatus(clonedEntity, entity).then(function(result) {
                    ActivitiesService.data.push(result);
                });

                var state = 'main.discussions.all' ;
                $state.go(state, {
                    entity: context.entityName,
                    entityId: context.entityId
                }, {
                    reload: true
                });

            });
        };


        $scope.deleteDiscussion = function (discussion) {
            DiscussionsService.remove(discussion._id).then(function () {

                $state.go('main.discussions.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };


        $scope.updateStatusForApproval = function(entity) {
            let context = {
                action:"updated",
                name:  "status",
                type:  "project"
            }
            entity.status = "waiting-approval" ;
            $scope.update(entity, 'status') ;
        }



        $scope.update = function (discussion, type) {

            $scope.updateDatesString();
            DiscussionsService.update(discussion);
            switch (type) {
                case 'startDue':
                case 'endDue':
                    DiscussionsService.updateDue(discussion, backupEntity, type).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.discussion));
                        ActivitiesService.data = ActivitiesService.data || [];
                        ActivitiesService.data.push(result);
                    });
                    break;

                case 'status':
                    DiscussionsService.updateStatus(discussion, backupEntity).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.discussion));
                        ActivitiesService.data = ActivitiesService.data || [];
                        ActivitiesService.data.push(result);
                    });
                    break;

                case 'location':
                    DiscussionsService.updateLocation(discussion, backupEntity).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.discussion));
                        ActivitiesService.data = ActivitiesService.data || [];
                        ActivitiesService.data.push(result);
                    });
                    break;

                case 'assign':
                    if (discussion.assign != null) {
                        let filtered = discussion.watchers.filter(watcher => {
                            // check the assignee is not a watcher already
                            return watcher == discussion.assign
                        });

                        // add assignee as watcher
                        if(filtered.length == 0) {
                            discussion.watchers.push(discussion.assign);
                        }
                    }

                    DiscussionsService.updateAssign(discussion, backupEntity).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.discussion));
                        ActivitiesService.data = ActivitiesService.data || [];
                        ActivitiesService.data.push(result);
                    });
                    break;
                case 'title':
                case 'description':
                    DiscussionsService.updateTitle(discussion, backupEntity, type).then(function(result) {
                        backupEntity = JSON.parse(JSON.stringify($scope.discussion));
                        ActivitiesService.data = ActivitiesService.data || [];
                        ActivitiesService.data.push(result);
                    });
                    break;
            }
        };

        var activeLocationTimeout;
        $scope.updateLocation = function(discussion) {
            if (activeLocationTimeout) {
                clearTimeout(activeLocationTimeout)
            }
            activeLocationTimeout = setTimeout(function(){
                $scope.update(discussion, 'location')
            }, 2000);
        }

        var activeTitleTimeout;
        $scope.$watch('discussion.title', function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                if (activeTitleTimeout) {
                    clearTimeout(activeTitleTimeout)
                }
                activeTitleTimeout = setTimeout(function(){
                    $scope.update($scope.discussion, 'title')
                }, 2000);
            }
        });

        var activeDescriptionTimeout, nText, oText;
        $scope.$watch('discussion.description', function (nVal, oVal) {
            nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            if (nText != oText && oText) {
                console.log(nVal, oVal)
                if (activeDescriptionTimeout) {
                    clearTimeout(activeDescriptionTimeout)
                }
                activeDescriptionTimeout = setTimeout(function(){
                    $scope.update($scope.discussion, 'description')
                }, 2000);
            }
        });

        $scope.updateCurrentDiscussion= function(){
            $scope.discussion.PartTitle = $scope.discussion.title;
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
