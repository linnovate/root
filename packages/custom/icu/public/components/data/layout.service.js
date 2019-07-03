'use strict';

angular.module('mean.icu.data.layoutservice', [])
.service('LayoutService', function () {
    var show = false;
    var state = Number(localStorage.getItem('layout')) || 4;

    function getShow() {
        return show;
    }

    function clicked() {
        show = true;
    }

    function unClick() {
        show = false;
    }
    function changeLayout() {
        state = state > 1 ? state-1 : 4;
        localStorage.setItem('layout', state)
        return state;
    }

    function getLayoutIcon() {
        if (state === 1)
            return '/icu/assets/img/sections2.svg'
        else if (state === 2)
                return '/icu/assets/img/sections1.svg'
            else if (state === 3)
                return '/icu/assets/img/sections2.svg'
                else return '/icu/assets/img/sections3.svg'

    }
    function getSideMenuIcon() {
        if (state === 4){
            return '/icu/assets/img/sections4.svg';
        }
        else if (state === 1)
            return '/icu/assets/img/sections7.svg';
    }
    function getLayoutState() {
        return state;
    }

    return {
        show: getShow,
        clicked: clicked,
        unClick: unClick,
        changeLayout: changeLayout,
        getLayoutIcon: getLayoutIcon,
        getSideMenuIcon: getSideMenuIcon,
        getLayoutState: getLayoutState
    };
});
