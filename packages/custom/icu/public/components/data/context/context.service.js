'use strict';

angular.module('mean.icu').service('context', function ($injector, $q) {
    var mainMap = {
        task: 'tasks',
        user: 'people',
        project: 'projects',
        discussion: 'discussions',
        officeDocument:'officeDocuments',
        office: 'offices',
        templateDoc: 'templateDocs',
        folder: 'folders'

    };

    return {
        entity: null,
        entityName: '',
        entityId: '',
        main: '',
        setMain: function (main) {
            this.main = mainMap[main];
        },
        getContextFromState: function(state) {
            var parts = state.name.split('.');

            if (parts[0] === 'main') {
                var reverseMainMap = _(mainMap).invert();
                var main = 'task';

                if (parts[1] !== 'search') {
                    main = reverseMainMap[parts[1]];
                }

                var params = state.params;
                var entityName = params.entity;

                if (!entityName && parts[2] === 'all') {
                    entityName = 'all';
                }

                if (!entityName && parts[2] === 'byassign') {
                    entityName = 'my';
                }

                if (!entityName && parts[2] === 'byparent') {
                    entityName = main;
                }

                return {
                    main: main,
                    entityName: entityName,
                    entityId: params.entityId
                };
            }
        }
    };
});
