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

angular.module('mean.icu.ui.tasklistFilter', [])
.filter('filterRecycled', function (EntityService,$state) {
	return function(entities) {
		if($state.current.name === "main.search.recycled") return entities ;
		if (!entities || !(entities instanceof Array)) return entities;
		var out = []
		out = entities.filter(function(entity) {
					return !("recycled" in entity)
				});
		return out ;
	}
})
.filter('filterByActiveStatus', function (EntityService) {
	return function(entities,type) {
		if (!entities || !(entities instanceof Array) || !EntityService.isActiveStatusAvailable()) return entities;
		if (!type) {
			type = { entity: "all"} ;
		}
		var filterValue = EntityService.activeStatusFilterValue;
		var out = []
		switch(filterValue) {
			default:
			out = 	entities.filter(function(entity) {
						var entityActiveValue = EntityService.getEntityActivityStatus(filterValue,type.entity,entity.status);
						return entityActiveValue ;
					});
		}
		return out;
	};
})
