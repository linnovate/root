'use strict';

angular.module('mean.icu.ui.subprojectslistdirective', []).directive('icuSubProjectList', function($state, $uiViewScroll, $stateParams, $timeout, UsersService) {
  var creatingStatuses = {
    NotCreated: 0,
    Creating: 1,
    Created: 2
  };

  var newProject = {
    title: '',
    watchers: [],
    tags: [],
    __state: creatingStatuses.NotCreated,
    __autocomplete: true
  };

  function controller($scope, ProjectsService, UsersService) {
    UsersService.getAll().then(function(people) {
      $scope.people = people;
    });

    $scope.isLoading = true;
    _($scope.projects).each(function(project) {
      if (project && project._id) {
        project.__state = creatingStatuses.Created;
      }
    });

    if (!$scope.displayOnly) {
      if (!$scope.projects.length || $scope.projects[$scope.projects.length - 1] && $scope.projects[$scope.projects.length - 1]._id) {
        $scope.projects.push(_(newProject).clone());
      }
    }

    $scope.createOrUpdate = function(project, field) {
      var data;
      project.color = '0097A7';
      var backupEntity = JSON.parse(JSON.stringify(project));

      if (field === 'assign') {
        data = {
          frequentUser: project.assign
        }

        // check the assignee is not a watcher already
        let filtered = project.watchers.filter(watcher=>{
          return watcher._id == project.assign && watcher != null
        }
        );

        // add assignee as watcher
        if (filtered.length == 0) {
          project.watchers.push(project.assign);
        }

        project.status = $scope.statuses[1];
      }
      if (project.__state === creatingStatuses.NotCreated) {
        project.__state = creatingStatuses.Creating;
        project.parent = $scope.parent;

        return ProjectsService.create(project).then(function(result) {
          project.__state = creatingStatuses.Created;

          ProjectsService.getById(project.parent).then(function(parentProj) {
            project.watchers = parentProj.watchers;
          });

          $scope.projects.push(_(newProject).clone());

          return project;
        });
      } else if (project.__state === creatingStatuses.Created) {
        if (field === 'assign') {
          UsersService.getMe().then(function(me) {
            ProjectsService.assign(project, me, backupEntity);
          });
        }
        return ProjectsService.update(project, data);
      }
    }

    $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

    $scope.searchResults = [];

    $scope.search = function(project) {
      if (!project.__autocomplete) {
        return;
      }

      var term = project.title;
      if (!term) {
        return;
      }

      $scope.searchResults.length = 0;
      $scope.selectedSuggestion = 0;
      ProjectsService.search(term).then(function(searchResults) {
        _(searchResults).each(function(sr) {
          var alreadyAdded = _($scope.projects).any(function(t) {
            return t._id === sr._id;
          });

          if (!alreadyAdded) {
            $scope.searchResults.push(sr);
          }
        });
        $scope.selectedSuggestion = 0;
      });

    }
    $scope.deleteShowDlt = function(subProject) {
      angular.forEach($scope.projects, function(st) {
        if (st._id !== subProject._id) {
          subProject.showDelete = false;
        }

      });
    }

    $scope.delete = function(subProject) {
      ProjectsService.remove(subProject._id).then(function(res) {
        var projectindex = _.findIndex($scope.projects, function(t) {
          return t._id === res._id;
        })
        $scope.projects.splice(projectindex, 1);
      });
    }

    $scope.select = function(selectedProject) {
      var currentProject = _($scope.projects).findIndex(function(t) {
        return t.id === $state.params.id;
      });

      $scope.createOrUpdate($scope.projects[currentProject + 1]).then(function(project) {
        console.log(project);
        // $state.go('main.projects.byparent.details', {
        //     id: project._id,
        //     parentId: project.parent._id || project.parent
        // });
      });
    }

    $scope.initDue = function(project) {
      if (project.due)
        project.due = new Date(project.due);
    }

    $scope.dueOptions = function(project) {
      return {
        onSelect: function() {
          $scope.createOrUpdate(project);
        },
        onClose: function() {
          if ($scope.checkDate(project)) {
            document.getElementById('ui-datepicker-div').style.display = 'block';
            $scope.open(project);
          } else {
            document.getElementById('ui-datepicker-div').style.display = 'none';
            $scope.open(project);
          }
        },
        dateFormat: 'dd/mm/yy'
      }
    }

    $scope.checkDate = function(project) {
      var d = new Date()
      d.setHours(0, 0, 0, 0);
      if (d > project.due) {
        return true;
      }
      return false;
    }

    $scope.open = function(project) {
      if ($scope.checkDate(project)) {
        document.getElementById('past' + project._id).style.display = document.getElementById('ui-datepicker-div').style.display;
        document.getElementById('past' + project._id).style.left = document.getElementById('ui-datepicker-div').style.left;
        document.getElementById('past' + project._id).style.top = (parseInt(document.getElementById('ui-datepicker-div').style.top) + 249) + 'px';
      } else {
        document.getElementById('past' + project._id).style.display = 'none';
      }
    }

    $scope.closeOldDateNotification = function(project) {
      document.getElementById('past' + project._id).style.display = 'none';
    }

    $scope.statuses = ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'];

  }

  function link($scope, $element) {
    var isScrolled = false;
    $scope.initialize = function($event, project) {
      if ($scope.displayOnly) {
        return;
      }

      var nameFocused = angular.element($event.target).hasClass('name');

      if (project.__state === creatingStatuses.NotCreated) {
        $scope.createOrUpdate(project)
      }
    }

    $scope.changeState = function(subProject) {
        console.log($scope.currentContext);
        // console.log(context);
      $state.go('main.projects.byparent.details', {
        id: subProject._id,
        entityId: subProject.parent._id || subProject.parent,
        nameFocused: false
      });
    }

    $scope.isCurrentState = function(id) {
      var isActive = ($state.current.name.indexOf('main.projects.byentity.details') === 0 || $state.current.name.indexOf('main.projects.all.details') === 0) && $state.params.id === id;

      if (isActive && !isScrolled) {
        $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
        isScrolled = true;
      }

      return isActive;
    }

    $scope.onEnter = function($event, index) {
      if ($event.keyCode === 13 || $event.keyCode === 9) {
        $event.preventDefault();

        $scope.projects[index].__autocomplete = false;
        if ($element.find('td.name')[index + 1]) {
          $element.find('td.name')[index + 1].focus();
        } else {
          $timeout(function() {
            $element.find('td.name')[index + 1].focus();
          }, 500);
        }

      }
    }

    $scope.focusAutoComplete = function($event) {
      angular.element($event.target).css('box-shadow', 'none')
      if ($event.keyCode === 38) {
        if ($scope.selectedSuggestion > 0) {
          $scope.selectedSuggestion -= 1;
        }
        $event.preventDefault();
      } else if ($event.keyCode === 40) {
        if ($scope.selectedSuggestion < $scope.searchResults.length - 1) {
          $scope.selectedSuggestion += 1;
        }
        $event.preventDefault();
      } else if ($event.keyCode === 13 || $event.keyCode === 9) {
        var sr = $scope.searchResults[$scope.selectedSuggestion];
        $scope.select(sr);
      }

    }

    $scope.hideAutoComplete = function(project) {
      project.__autocomplete = false;
      $scope.searchResults.length = 0;
      $scope.selectedSuggestion = 0;
    }

    // infinite scroll
    $timeout(function() {
      $scope.displayLimit = Math.ceil($element.height() / 50);
      $scope.isLoading = false;
    }, 0);

    $scope.loadMore = function() {
      if (!$scope.isLoading && $scope.loadNext) {
        $scope.isLoading = true;
        $scope.loadNext().then(function(projects) {

          _(projects.data).each(function(t) {
            t.__state = creatingStatuses.Created;
          });

          var offset = $scope.displayOnly ? 0 : 1;

          if (projects.data.length) {
            var index = $scope.projects.length - offset;
            $scope.projects.pop();
            var args = [index, 0].concat(projects.data);
            [].splice.apply($scope.projects, args);
            $scope.projects.push(_(newProject).clone());
          }

          $scope.loadNext = projects.next;
          $scope.loadPrev = projects.prev;
          $scope.isLoading = false;
        });
      }
    }
  }

  return {
    restrict: 'EA',
    templateUrl: '/icu/components/sub-projects/sub-project-list.directive.template.html',
    scope: {
      project: '=',
      projects: '=',
      loadNext: '=',
      loadPrev: '=',
      drawArrow: '=',
      groupProjects: '=',
      order: '=',
      displayOnly: '=',
      autocomplete: '=',
      parent: '@',
      people: '='
    },
    link: link,
    controller: controller
  };
});
