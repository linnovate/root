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
    let type = entityIssueMap[entityName];

    return new UpdateModel({
      creator: options.user,
      data: new Date(),
      entity: id,
      entityType: type
    }).save({
      user: options.user
    });
  }

  function updated(id) {
    let type = entityIssueMap[entityName];

    return new UpdateModel({
      creator: options.user,
      data: new Date(),
      entity: id,
      entityType: type
    }).save({
      user: options.user
    });
  }

  return {
    created: created,
    updated: updated
  };
};
