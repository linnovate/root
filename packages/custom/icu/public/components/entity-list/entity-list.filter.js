'use strict';

Date.prototype.getThisDay = function()
{
    var date = new Date();
    return [date.setHours(0,0,0,0), date.setHours(23,59,59,999)];
}

Date.prototype.getWeek = function()
{
    var curr = new Date(this.setHours(0, 0, 0, 0));
    var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
	var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay()+6));
	lastday = new Date(lastday.setHours(23, 59, 59, 0))
    return [firstday, lastday];
}

angular.module('mean.icu.ui.entityListFilters', [])
.filter('filterRecycled', function (EntityService,$state) {
	return function(entities) {
		if($state.current.name === "main.search.recycled") return entities ;
		if (!entities || !(entities instanceof Array)) return entities;
		let out = entities.filter(entity => !entity.recycled);
		return out;
	}
})
.filter('filterByActiveStatus', function (EntityService) {
	return function(entities,type) {
		if (!entities || !(entities instanceof Array) || !EntityService.isActiveStatusAvailable()) return entities;
		//if (!type) {
// 		type = { entity: type };
		//}
		var filterValue = EntityService.activeStatusFilterValue;
		var out = [];
		switch (filterValue) {
			default:
				out = entities.filter(entity => {
					if (!entity.hasOwnProperty('status')) {
						return true;
					}
					switch(type) {
						case 'all':
							return true;
							break;
						case 'active':
							return  ['new', 'assigned', 'in-progress', 'review'].includes(entity.status);
							break;
						case 'nonactive':
							return  ['rejected', 'done', 'archived', 'canceled', 'done'].includes(entity.status);
							break;
					}
					return true;
				});
		}
		return out;
	};
})
.filter('filterByOptions', function (TasksService) {
	return function(tasks) {
		if (!tasks || !(tasks instanceof Array)) return tasks;
		var filterValue = TasksService.filterValue;
		var out = [];

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
})
.filter('sortByTitle', function (UsersService) {
	return function(entities, sorting, reverse) {
		if (!entities || !(entities instanceof Array)) return entities;
		let me = UsersService.getCurrentUser(),
		  allFilters = attributeFilters(me),
		  filters = allFilters[sorting] ? allFilters[sorting] : allFilters.default;

		return entities.sort((a, b) => {
			let filterValue = obj => filters(obj[sorting]),
			  first = filterValue(a), second = filterValue(b),
			  result = first > second ? -1 : first < second ? 1 : 0;

			return reverse ? result * -1 : result;
		});
	};
});

const attributeFilters = me => ({
	title: titleWithHTMLTags => titleWithHTMLTags.replace(/<(?:.|\n)*?>/gm, ''),
  	created: dateString => new Date(dateString),
  	bolded: boldedArray => {
		let bolded = boldedArray.find(b => b.bolded && me._id === b.id);
      	return bolded ? new Date(bolded.lastViewed) : new Date(1000, 1, 1);
    },
  	default: value => value
});



