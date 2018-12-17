'use strict';

angular.module('mean.icu.data.layoutservice', [])
.service('LayoutService', function (LocalStorageService) {
    var show = false, state = 4;

    //for saving hided layout state after refreshing the page
    let savedValue = LocalStorageService.load("layoutState");
    if(Number.isInteger(+savedValue))
    state = +savedValue;

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
        if (state > 1) state --;
        else state = 4;
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

    function getStateValue(){
        return state;
    }

    return {
        show: getShow,
        clicked: clicked,
        unClick: unClick,
        changeLayout: changeLayout,
        getStateValue: getStateValue,
        getLayoutIcon: getLayoutIcon,
        getSideMenuIcon: getSideMenuIcon
    };
});
