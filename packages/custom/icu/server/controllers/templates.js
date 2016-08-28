'use strict';

var options = {
  includes: '',
  defaults: {},
  conditions: {
    tType: 'template'
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var template = crud('templates', options);

var Task = require('../models/task');

Object.keys(template).forEach(function(methodName) {
  if (methodName === 'all') {
    exports[methodName] = template[methodName];
  }
});

var addToTemplate = function(task, parentId, name, creator, callback) {
  var template = new Task({
    tType: 'template',
    title: name || task.title,
    parent: parentId,
    creator: creator,
    tags: task.tags,
    description: task.description
  });
  callback({
    s: task.subTasks.length,
    t: template
  })
}

var addRecorsiveTemplates = function(taskId, name, parentId, creator, templates, totals, callback) {
  Task.findOne({
    '_id': taskId
  })
    .exec(function(err, task) {
      totals.tasks += task.subTasks.length;
      addToTemplate(task, parentId, name, creator, function(template) {
        templates[template.t._id] = template;
        if (parentId) {
          templates[parentId].t.subTasks.push(template.t._id);
        }
        totals.templates++;
        if (totals.templates === totals.tasks) {
          return callback(templates);
        }
        for (var i = 0; i < task.subTasks.length; i++) {
          addRecorsiveTemplates(task.subTasks[i], null, template.t._id, creator, templates, totals, callback);
        }
      })
    });
}

exports.toTemplate = function(req, res, next) {
  //TODO: save documents
  var templates = {},
    totals = {
      templates: 0,
      tasks: 0
    };
  var query = req.acl.query('Task');
  console.dir(req.body)
  query.findOne({
    '_id': req.params.id
  })
    .exec(function(err, task) {
      if (err) {
        req.locals.error = err;
      } else {
        totals.tasks = 1;
        addRecorsiveTemplates(req.params.id, req.body.name, null, req.user._id, templates, totals, function(templates) {
          for (var t in templates) {
            templates[t].t.save();
          }
        });
        req.locals.result = task;
      }
      next();
    });
}