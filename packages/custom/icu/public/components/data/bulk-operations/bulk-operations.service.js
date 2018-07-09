'use strict';

angular.module('mean.icu.data.multipleselectservice', [])
    .service('MultipleSelectService', function(ApiUri, $http, $stateParams, $rootScope,
                                            NotifyingService,OfficesService,UsersService,DiscussionsService,
                                            TasksService, ProjectsService, PaginationService, MeanSocket,
                                            WarningsService, ActivitiesService, FoldersService, OfficeDocumentsService,
                                            TemplateDocsService, PermissionsService
    ) {
        var EntityPrefix = '/permissions';
        var me = UsersService.getMe().$$state.value;

        var serviceMap = {
            task: TasksService,
            tasks: TasksService,
            project: ProjectsService,
            projects: ProjectsService,
            discussion: DiscussionsService,
            discussions: DiscussionsService,
            office: OfficesService,
            offices: OfficesService,
            folder: FoldersService,
            folders: FoldersService,
            officeDocument: OfficeDocumentsService,
            officeDocuments: OfficeDocumentsService,
            templateDoc: TemplateDocsService,
            templateDocs: TemplateDocsService,
        };

        var bulkPermissionsMap = {
            'status' : ['editor'],
            'assign' : ['editor'],
            'watcher' : ['editor'],
            'due' : ['editor'],
            'tag' : ['editor'],
            'delete' : ['editor'],

        };

        function haveBulkPerms(entitiesArray, type) {
            let havePerms = entitiesArray.each((entity)=>{

            })
            PermissionsService
            return perms;
        }

        return {
            haveBulkPerms: haveBulkPerms,
        };
    });
