angular.module('mean.icu.ui.usersFilter', [])
.filter('filterByFrequentUsers', function () {
	return function(users, me) {
        if (!users) return []; 
        var frequent = me.profile ? me.profile.frequentUsers : {};
        var usersClone = users;
        function sortObject(obj) {
            var arr = [];
            var prop;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    arr.push({
                        'key': prop,
                        'value': obj[prop]
                    });
                }
            }
            arr.sort(function(a, b) {
                return a.value - b.value;
            });
            return arr; // returns array
        }
        var arr = sortObject(frequent).reverse();
        function findElem(element) {
            return element._id === this.key;
        }
        var ordered = [];
        for(var i =0; i<= arr.length; i++) {
            var q = usersClone.findIndex(findElem, arr[i]);
            if (q > -1 && arr[i]) {
                ordered.push(users[q]);
                usersClone.splice(q, 1);
            }
        }
        return ordered.concat(usersClone);
		
	}
});
