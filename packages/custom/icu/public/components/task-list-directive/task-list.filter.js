'use strict';

Date.prototype.getThisDay = function()
{
    var date = new Date();
    return [date.setHours(0,0,0,0), date.setHours(23,59,59,999)];
}

Date.prototype.getWeek = function()
{
    var today = new Date(this.setHours(0, 0, 0, 0));
    var date = today.getDate() - today.getDay();

    var StartDate = new Date(today.setDate(date));
    var EndDate = new Date(today.setDate(date + 6));
    return [StartDate, EndDate];
}

angular.module('mean.icu.ui.tasklistFilter', [])
.filter('filterByOptions', function (TasksService) {
	return function(tasks) {
		if (!tasks || !(tasks instanceof Array)) return tasks;
		var filterValue = TasksService.filterValue;
		var out = []

		switch(filterValue) {
			case 'today':
				var date = new Date().getThisDay();
				tasks.forEach(function(task) {
					var due = new Date(task.due);
					if (due >= date[0] && due <= date[1]) {
						out.push(task)
					};
				});
				break;
			case 'week':
				var date = new Date().getWeek();
				tasks.forEach(function(task) {
					var due = new Date(task.due);
					if (due >= date[0] && due <= date[1]) {
						out.push(task)
					};
				});
				break;
			case 'overdue':
				var date = new Date().getThisDay();
				tasks.forEach(function(task) {
					var due = new Date(task.due);
					if (due < date[0]) {
						out.push(task)
					};
				});
				break;
			case 'watched':
				if(TasksService.watchedTasksArray!=undefined){
					TasksService.watchedTasksArray.forEach(function(task){
						task.PartTitle = task.title.length<20?task.title: (task.title.substring(0,20)+"...");
						out.push(task);
					});
				}
				break;
			default:
				out = tasks;
		}
		return out;
	}
});

