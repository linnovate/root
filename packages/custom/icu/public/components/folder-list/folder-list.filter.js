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

angular.module('mean.icu.ui.folderlistFilters', [])
.filter('filterByOptionsFolder', function (FoldersService) {
	return function(folders) {
		if (!folders || !(folders instanceof Array)) return folders;
		var filterValue = FoldersService.filterValue;
		var out = []

		switch(filterValue) {
			case 'today':
				var date = new Date().getThisDay();
				folders.forEach(function(folder) {
					var due = new Date(folder.due);
					if (due >= date[0] && due <= date[1]) {
						out.push(folder)
					};
				});
				break;
			case 'week':
				var date = new Date().getWeek();
				folders.forEach(function(folder) {
					var due = new Date(folder.due);
					if (due >= date[0] && due <= date[1]) {
						out.push(folder)
					};
				});
				break;
			case 'overdue':
				var date = new Date().getThisDay();
				folders.forEach(function(folder) {
					var due = new Date(folder.due);
					if (due < date[0]) {
						out.push(folder)
					};
				});
				break;
			case 'watched':
				if(FoldersService.watchedFoldersArray!=undefined){
					FoldersService.watchedFoldersArray.forEach(function(folder){
						folder.PartTitle = folder.title.length<20?folder.title: (folder.title.substring(0,20)+"...");
						out.push(folder);
					});
				}
				break;
			default:
				out = folders;
		}
		return out;
	}
});

