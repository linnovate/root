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

        function bulkUpdate(entityArray) {
            return $http.post(ApiUri + EntityPrefix, entityArray)
                .then(function (result) {
                    return result.data;
                });
        }

        function haveBulkPerms(entitiesArray, type) {
            let havePermissions = entitiesArray.each((entity)=>{
                let userPermissions = entity.permissions.find((permission)=>{
                    return permission.id === me._id;
                });
                return _.includes(bulkPermissionsMap[type], userPermissions.level);
            });

            return havePermissions;
        }

        return {
            bulkUpdate: bulkUpdate,
            haveBulkPerms: haveBulkPerms,
        };
    });
