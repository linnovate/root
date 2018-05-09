'use strict';

var UpdateModel = require('../models/update.js');

var entityIssueMap = {
  tasks: 'task',
  projects: 'project',
  discussions: 'discussion',
  offices: 'office',
  folders: 'folder',
  officeDocuments: 'officeDocument'
};

module.exports = function(entityName, options) {
  function created(id) {
    var type = entityIssueMap[entityName];

    return new UpdateModel({
      creator: options.user,
      created: new Date(),
      type: 'create',
      issueId: id,
      issue: type
    }).save({
      user: options.user
    });
  }

  function updated(id) {
    var type = entityIssueMap[entityName];

    return new UpdateModel({
      creator: options.user,
      created: new Date(),
      type: 'update',
      issueId: id,
      issue: type
    }).save({
      user: options.user
    });
  }

  return {
    created: created,
    updated: updated
  };
};
