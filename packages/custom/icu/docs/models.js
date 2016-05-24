exports.models = {

  User: {
    id: 'User',
    required: ['name', 'email', 'username'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier for the User'
      },
      name: {
        type: 'string',
        description: 'Name of the user'
      },
      email: {
        type: 'string',
        description: 'Email of the user'
      },
      username: {
        type: 'string',
        description: 'Unique username'
      },
      roles: {
        type: 'array',
        description: 'List of user\'s roles'
      },
      profile: {
        type: 'object',
        description: 'The user\'s personal profiles'
      }
    }
  },
  Comment: {
    id: 'Comment',
    required: ['title', 'task', 'text'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier for the comment'
      },
      title: {
        type: 'string',
        description: 'title of comment'
      },
      text: {
        type: 'string',
        description: 'text of comment'
      },
      task: {
        type: 'string',
        description: 'id of task'
      },
      creator: {
        type: 'string',
        description: 'id of user who created the comment'
      }

    }
  },
  Task: {
    id: 'Task',
    required: ['title', 'project'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier for the task'
      },
      title: {
        type: 'string',
        description: ''
      },
      project: {
        type: 'string',
        description: 'id of project'
      },
      parent: {
        type: 'string',
        description: 'id of another task'
      },
      creator: {
        type: 'string',
        description: 'id of user who created the task'
      },
      manager: {
        type: 'string',
        description: 'id of user who manages the task'
      },
      description: {
        type: 'string',
        description: 'description of discussion'
      },
      tags: {
        type: 'array',
        description: 'array of tags '
      },
      status: {
        type: 'string',
        description: 'enum: [\'New\', \'Assigned\', \'In progress\', \'Review\', \'Rejected\', \'Done\']'
      },
      due: {
        type: 'date',
        description: 'due date of task'
      },
      watchers: {
        type: 'array',
        description: 'array of ids of watchers users'
      },
      assign: {
        type: 'string',
        description: 'id of user who assigned the task'
      },
      discussions: {
        type: 'array',
        description: 'array of ids of discussions'
     }

    }
  },
  Project: {
    id: 'Project',
    required: ['title'],
    properties: {
      title: {
        type: 'string',
        description: 'title of project'
      },
      parent: {
        type: 'string',
        description: 'id of another project'
      },
      discussion: {
        type: 'string',
        description: 'id of discussion'
      },
      creator: {
        type: 'string',
        description: 'id of user who created the project'
      },
      manager: {
        type: 'string',
        description: 'id of user who manages the project'
      },
      signature: {
        circles: {},
        codes: {}
      },
      color: {
        type: 'string',
        description: 'color'
      },
      description: {
        type: 'string',
        description: 'description of discussion'
      },
      watchers: [{
        type: 'array',
        description: 'array of ids of watchers users'
      }],
      room: {
        type: 'string',
        description: 'id of letschat room'
      },
      status: {
        type: 'string',
        description: 'enum: [\'New\', \'Archived\', \'Cancelled\', \'In-Progress\', \'Completed\']'
      }
    }
  },
  Attachment: {
    id: 'Attachment',
    required: ['name', 'issue', 'issueId'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier for the attachment'
      },
      created: {
        type: 'string',
        description: 'created date of attachment'
      },
      updated: {
        type: 'string',
        description: 'last updated date of attachment'
      },
      name: {
        type: 'string',
        description: 'name of attachment'
      },
      path: {
        type: 'string',
        description: 'path direction of attachment'
      },
      attachmentType: {
        type: 'string',
        description: 'the file extension of the attachment'
      },
      issue: {
        type: 'string',
        description: 'name of issue the attachment related to'
      },
      issueId: {
        type: 'string',
        description: 'id of issue the attachment related to'
      },
      creator: {
        type: 'string',
        description: 'id of user who created the attachment'
      },
      updater: {
        type: 'string',
        description: 'id of user who updated the attachment'
      },
      room: {
        type: 'string',
        description: 'id of letschat room'
      }
    }
  },
  Discussion: {
    id: 'Discussion',
    required: ['name'],
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier for the discussion'
      },
      created: {
        type: 'string',
        description: 'created date of discussion'
      },
      updated: {
        type: 'string',
        description: 'last updated date of discussion'
      },
      title: {
        type: 'string',
        description: 'name of discussion'
      },
      project: {
        type: 'string',
        description: 'id of project'
      },
      description: {
        type: 'string',
        description: 'description of discussion'
      },
      content: {
        type: 'string',
        description: 'content of discussion (short description)'
      },
      creator: {
        type: 'string',
        description: 'id of user who created the discussion'
      },
      assign: {
        type: 'string',
        description: 'id of user who owner the discussion'
      },
      due: {
        type: 'string',
        description: 'date of discussion'
      },
      active: {
        type: 'string',
        description: 'active of discussion'
      },
      members: {
        type: 'array',
        description: 'array of ids of members'
      },
      watchers: {
        type: 'array',
        description: 'array of ids of watchers users'
      },
      status: {
        type: 'string',
        description: 'enum: [\'New\', \'Scheduled\', \'Done\', \'Cancelled\', \'Archived\']'
      }
    }
  },
  Archive: {
    id: 'Archive',
    properties: {

      t: {
        type: 'date',
        description: 'date of update'
      },
      o: {
        type: 'string',
        description: 'operation type(i=insert/u=update/d=delete)'
      },
      d: {
        type: 'Schema.Types.Mixed',
        description: 'updated data'
      },
      u: {
        type: 'Schema.ObjectId',
        description: 'id of user who update the data'
      }
    }
  }
};