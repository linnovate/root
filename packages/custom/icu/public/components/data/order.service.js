'use strict';

angular.module('mean.icu.data.orderservice', [])
.service('orderService', function (ApiUri, $http, WarningsService) {
	function setOrder(task, elindex, dropindex, size) {
		var tasks ={
		   elindex: elindex,
		   dropindex:dropindex,
		   main: task.currentScope.context.main,
		   entityName: task.currentScope.context.entityName,
		   entityId: task.currentScope.context.entityId,
		   size: size	         
		}
		return $http.post(ApiUri + '/order/set',tasks).then(function (result) {
			WarningsService.setWarning(result.headers().warning);
	        return result.data;
	    });
	}
    return {
        setOrder: setOrder
    };
});
