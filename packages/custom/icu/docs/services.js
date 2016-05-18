'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var usersList = {
    'spec': {
      description: 'Users operations',
      path: '/users',
      method: 'GET',
      summary: 'Get all Users',
      notes: '',
      type: 'User',
      nickname: 'getUsers',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var showProfile = {
    'spec': {
      description: 'Users operations',
      path: '/propile',
      method: 'GET',
      summary: 'Get user\'s profile',
      notes: '',
      type: '{}',
      nickname: 'getProfile',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var updateProfile = {
    'spec': {
      description: 'Users operations',
      path: '/propile',
      method: 'PUT',
      summary: 'Update user\'s profile',
      notes: '',
      type: '{}',
      nickname: 'updateProfile',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
        name: 'body',
        description: 'User\'s profile to update.  User will be inferred by the authenticated user.',
        required: true,
        type: '{}',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var uploadAvatar = {
    'spec': {
      description: 'Users operations',
      path: '/avatar',
      method: 'POST',
      summary: 'upload user\'s avatar',
      notes: '<p>Request URL: host/api/avatar.</p> <p>You can use it with html file upload, for example: https://github.com/danialfarid/ng-file-upload.</p>',
      type: '{}',
      nickname: 'uploadAvatar',
      produces: ['multipart/form-data'],
      parameters: [{
        name: 'body',
        dataType: 'file',
        description: 'avatar',
        required: true,
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var tasksList = {
    'spec': {
      description: 'Tasks operations',
      path: '/tasks',
      method: 'GET',
      summary: 'Get tasks list',
      notes: 'The really path is \'/tasks\' ',
      type: '',
      nickname: 'GetTasks',
      produces: ['application/json'],
      params: searchParms
    }
  };
  
  var tasksList = {
    'spec': {
      description: 'Tasks operations',
      path: '/tasks',
      method: 'GET',
      summary: 'Get tasks list',
      notes: 'The really path is \'/tasks\'. \n you can add query as: /tasks?status=completed&tags=1,2,3',
      type: '',
      nickname: 'GetTasks',
      produces: ['application/json'],
      params: ['status']
    }
  };

  var tagsList = {
    'spec': {
      description: 'List of all tags',
      path: '/tasks/tags',
      method: 'GET',
      summary: 'Get tags list',
      notes: 'The really path is \'/tasks/tags\' ',
      type: 'string',
      nickname: 'GetTags',
      produces: ['application/json'],
      params: searchParms
    }

  };

  var createTask = {
    'spec': {
      description: 'Task creation',
      path: '/tasks',
      method: 'POST',
      summary: 'create a task',
      notes: ' ',
      type: 'Task',
      nickname: 'createTask',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'task to create',
        required: true,
        type: 'Task',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var getTask = {
    'spec': {
      description: 'get a single task',
      path: '/tasks/:id',
      method: 'GET',
      summary: 'get a single task',
      notes: 'The really path is \'/tasks/:id\' ',
      type: 'Task',
      nickname: 'GetTask',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var updateTask = {
    'spec': {
      description: 'Update a task',
      path: '/tasks/:id',
      method: 'PUT',
      summary: 'Update a task',
      notes: 'The really path is \'/tasks/:id\'',
      type: 'Task',
      nickname: 'updateTask',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
        name: 'body',
        description: 'task to update',
        required: true,
        type: 'Task',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var deleteTask = {
    'spec': {
      description: 'Delete a task',
      path: '/tasks/:id',
      method: 'DELETE',
      summary: 'delete a task',
      notes: 'The really path is \'/tasks/:id\'',
      type: 'Task',
      nickname: 'deleteTask',
      produces: ['application/json']
    }
  };

  var getTasksPerEntity = {
    'spec': {
      description: 'get a list of tasks per user/project/discussion',
      path: '/:entity/:id/tasks',
      method: 'GET',
      summary: 'get a list of tasks per user/project/...',
      notes: '',
      type: 'Task',
      nickname: 'GetTask',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var zombieTasks = {
    'spec': {
      description: 'get a list of zombie tasks',
      path: '/tasks/zombie',
      method: 'GET',
      summary: 'get zombie tasks list',
      notes: '',
      type: 'Task',
      nickname: 'getZombieTasks',
      produces: ['application/json'],
      params: searchParms
  }
};

  var tasksHistory = {
    'spec': {
      description: 'get all updates history for a single task',
      path: '/history/tasks/:id',
      method: 'GET',
      summary: 'get all updates history for a single task',
      notes: '',
      type: 'Archive',
      nickname: 'GetTaskHistory',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var createProject = {
    'spec': {
      description: 'Project creation',
      path: '/projects',
      method: 'POST',
      summary: 'create a project',
      notes: '------------------------there is a problem to create via swagger, because you don\'t have req.user------------------',
      type: 'Project',
      nickname: 'createProject',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'Project to create',
        required: true,
        type: 'Project',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var projectsList = {
    'spec': {
      description: 'project operations',
      path: '/projects',
      method: 'GET',
      summary: 'Get projects list',
      notes: '',
      type: 'Project',
      nickname: 'GetTasks',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var projectsHistory = {
    'spec': {
      description: 'get all updates history for a single project',
      path: '/history/projects/:id',
      method: 'GET',
      summary: 'get all updates history for a single project',
      notes: '',
      type: 'Project',
      nickname: 'GetProjectHistory',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var attachmentsList = {
    'spec': {
      description: 'attachments operations',
      path: '/attachments',
      method: 'GET',
      summary: 'Get attachments list',
      notes: '',
      type: 'Attachment',
      nickname: 'GetAttachments',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var getAttachmentsPerEntity = {
    'spec': {
      description: 'get a list of attachments whose issue is a project/discussion/task/update',
      path: '/:entity/:id/attachments',
      method: 'GET',
      summary: 'get a list of attachments per project/discussion/task/update',
      notes: '',
      type: 'Attachment',
      nickname: 'attachmentByEntity',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var createAttachment = {
    'spec': {
      description: 'Attachment creation',
      path: '/attachments',
      method: 'POST',
      summary: 'Create an attachment',
      type: 'Attachment',
      nickname: 'createAttachment',
      produces: ['multipart/form-data'],
      notes: '<p>You can use it with html file upload, for example: https://github.com/danialfarid/ng-file-upload.</p><p> On fields you must send {issue: "string", issueId: "string"}.</p><p>------------------------there is a problem to create via swagger, because you can\'t upload file------------------</p>'
    }
  };

  var updateAttachment = {
    'spec': {
      description: 'Update an attachment',
      path: '/attachments/:id',
      method: 'POST',
      summary: 'Update an attachment',
      type: 'Attachment',
      nickname: 'updateAttachment',
      produces: ['multipart/form-data'],
      notes: '<p>You can use it with html file upload, for example: https://github.com/danialfarid/ng-file-upload.</p><p> On fields you must send {issue: "string", issueId: "string"}.</p><p>------------------------there is a problem to create via swagger, because you can\'t upload file------------------</p>'
    }
  };

  var attachmentsHistory = {
    'spec': {
      description: 'get all updates history for a single attachment',
      path: '/history/attachments/:id',
      method: 'GET',
      summary: 'get all updates history for a single attachment',
      notes: '',
      type: 'Archive',
      nickname: 'GetAttachmentHistory',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var starredEntities = {
    'spec': {
      description: 'get all starred entities of user',
      path: '/:entity/starred',
      method: 'GET',
      summary: 'get all starred entities of user',
      type: ['Task', 'Project', 'Discussion'],
      nickname: 'starredEntities',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var starEntity = {
    'spec': {
      description: 'star or unstar a entity',
      path: '/:entity/:id/star',
      method: 'PATCH',
      summary: 'star or unstar a entity',
      type: ['Task', 'Project', 'Discussion'],
      nickname: 'starEntity',
      produces: ['application/json']
    }
  };

  var generalSearch = {
    'spec': {
      description: 'search a term in whole data',
      path: '/search',
      method: 'GET',
      summary: 'search a term in whole data',
      type: ['Task', 'Project', 'User'],
      nickname: 'search',
      produces: ['application/json'],
      parameters: [{
        name: 'term',
        required: false,
        type: 'string',
        paramType: 'query',
        allowMultiple: false,
        description: 'what to search'
      }, {
        name: 'index',
        required: false,
        type: 'string',
        paramType: 'query',
        allowMultiple: false,
        description: 'index to search'
      }],
      notes: 'get the search results grouped by type (task, project...)'
    }
  };

  var commentsList = {
    'spec': {
      description: 'comment operations',
      path: '/comments',
      method: 'GET',
      summary: 'Get comments list',
      notes: '',
      type: 'Comment',
      nickname: 'GetComments',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var commentShow = {
    'spec': {
      description: 'comment operations',
      path: '/comments/:id',
      method: 'GET',
      summary: 'Get one comment by _id',
      notes: '',
      type: 'Comment',
      nickname: 'commentShow',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var commentCreate = {
    'spec': {
      description: 'comment creation',
      path: '/comments',
      method: 'POST',
      summary: 'create a comment',
      notes: '------------------------there is a problem to create via swagger, because you don\'t have req.user------------------',
      type: 'Comment',
      nickname: 'commentCreate',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'comment to create',
        required: true,
        type: 'Comment',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var commentUpdate = {
    'spec': {
      description: 'Update a comment',
      path: '/comments/:id',
      method: 'PUT',
      summary: 'Update a comment',
      type: 'Comment',
      nickname: 'commentUpdate',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
        name: 'body',
        description: 'comment to update',
        required: true,
        type: 'Comment',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var commentDelete = {
    'spec': {
      description: 'Delete a comment',
      path: '/comments/:id',
      method: 'DELETE',
      summary: 'delete a comment',
      type: 'Comment',
      nickname: 'commentDelete',
      produces: ['application/json'],
    }
  };

  var commentHistory = {
    'spec': {
      description: 'get all updates history for a single comment',
      path: '/history/comments/:id',
      method: 'GET',
      summary: 'get all updates history for a single comment',
      notes: '',
      type: 'Comment',
      nickname: 'GetCommentHistory',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var discussionsList = {
    'spec': {
      description: 'discussion operations',
      path: '/discussions',
      method: 'GET',
      summary: 'Get discussions list',
      notes: '',
      type: 'Discussion',
      nickname: 'GetDiscussions',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var discussionShow = {
    'spec': {
      description: 'discussion operations',
      path: '/discussions/:id',
      method: 'GET',
      summary: 'Get one discussion by _id',
      notes: '',
      type: 'Discussion',
      nickname: 'discussionShow',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var discussionCreate = {
    'spec': {
      description: 'discussion creation',
      path: '/discussions',
      method: 'POST',
      summary: 'create a discussion',
      notes: '------------------------there is a problem to create via swagger, because you don\'t have req.user------------------',
      type: 'Discussion',
      nickname: 'discussionCreate',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'discussion to create',
        required: true,
        type: 'Discussion',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var discussionUpdate = {
    'spec': {
      description: 'Update a discussion',
      path: '/discussions/:id',
      method: 'PUT',
      summary: 'Update a discussion',
      type: 'Discussion',
      nickname: 'discussionUpdate',
      produces: ['application/json'],
      params: searchParms,
      parameters: [{
        name: 'body',
        description: 'discussion to update',
        required: true,
        type: 'Discussion',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  var discussionDelete = {
    'spec': {
      description: 'Delete a discussion',
      path: '/discussions/:id',
      method: 'DELETE',
      summary: 'delete a discussion',
      type: 'Discussion',
      nickname: 'discussionDelete',
      produces: ['application/json'],
    }
  };

  var discussionHistory = {
    'spec': {
      description: 'get all updates history for a single discussion',
      path: '/history/discussions/:id',
      method: 'GET',
      summary: 'get all updates history for a single discussion',
      notes: '',
      type: 'Discussion',
      nickname: 'GetDiscussionHistory',
      produces: ['application/json'],
      params: searchParms
    }
  };

  var getDiscussionsPerEntity = {
    'spec': {
        description: 'get a list of attachments whose issue is a project/discussion/task/update',
        path: '/:entity/:id/discussions',
        method: 'GET',
        summary: 'get a list of discussions per project',
        notes: '',
        type: 'Discussion',
        nickname: 'discussionByEntity',
        produces: ['application/json'],
        params: searchParms
    }
  };

  swagger
    .addGet(usersList)
    .addGet(showProfile)
    .addGet(tasksList)
    .addPost(createTask)
    .addPut(updateProfile)
    .addPost(uploadAvatar)
    .addGet(projectsList)
    .addGet(projectsHistory)
    .addPost(createProject)
    .addGet(tagsList)
    .addGet(getTask)
    .addPut(updateTask)
    .addDelete(deleteTask)
    .addGet(getTasksPerEntity)
    .addGet(zombieTasks)
    .addGet(tasksHistory)
    .addGet(attachmentsList)
    .addGet(getAttachmentsPerEntity)
    .addPost(createAttachment)
    .addPost(updateAttachment)
    .addGet(attachmentsHistory)
    .addGet(starredEntities)
    .addPatch(starEntity)
    .addGet(commentsList)
    .addGet(commentShow)
    .addPost(commentCreate)
    .addPut(commentUpdate)
    .addDelete(commentDelete)
    .addGet(commentHistory)
    .addGet(generalSearch)
    .addGet(discussionsList)
    .addGet(discussionShow)
    .addPost(discussionCreate)
    .addPut(discussionUpdate)
    .addDelete(discussionDelete)
    .addGet(discussionHistory)
    .addGet(getDiscussionsPerEntity)
};