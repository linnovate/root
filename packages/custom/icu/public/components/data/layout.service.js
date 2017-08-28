'use strict';

angular.module('mean.icu.data.layoutservice', [])
.service('LayoutService', function () {
	var show = false;

    function getShow() {
        return show;
    }

    function clicked() {
        show = true;
    }

    function unClick() {
        show = false;
    }

    return {
        show: getShow,
        clicked: clicked,
        unClick: unClick
    };
});
