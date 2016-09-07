'use strict';

var options = {
  includes: '',
  defaults: {},
  conditions: {
    tType: 'template',
    parent: null
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var template = crud('templates', options);

var Task = require('../models/task');

Object.keys(template).forEach(function(methodName) {
  if (methodName !== 'create') {
    exports[methodName] = template[methodName];
  }
});

var addToTemplate = function(task, parentId, name, creator, watchers, exist, tType, callback) {
  if (!exist) {
    var template = new Task({
      tType: tType,
      title: name || task.title,
      parent: parentId,
      creator: creator,
      tags: task.tags,
      description: task.description,
      watchers: watchers
    });
    callback({
      s: task.subTasks.length,
      t: template
    });
  } else {
    Task.findOne({
      '_id': exist
    }).exec(function(err, existTask) {
      if (err) {
        console.log(err);
      }
      callback({
        s: task.subTasks.length,
        t: existTask
      });
    });
  }
}

var addRecorsiveTemplates = function(taskId, name, parentId, creator, watchers, exist, tType, templates, totals, callback) {
  Task.findOne({
    '_id': taskId
  })
    .exec(function(err, task) {
      if (task) {
        totals.tasks += task.subTasks.length;
        addToTemplate(task, parentId, name, creator, watchers, exist, tType, function(template) {
          templates[template.t._id] = template;
          if (parentId) {
            templates[parentId].t.subTasks.push(template.t._id);
          }
          totals.templates++;
          if (totals.templates === totals.tasks) {
            return callback(templates);
          }
          watchers = template.t.watchers;
          for (var i = 0; i < task.subTasks.length; i++) {
            addRecorsiveTemplates(task.subTasks[i], null, template.t._id, creator, watchers, false, tType, templates, totals, callback);
          }
        })
      } else {
        totals.templates++;
        if (totals.templates === totals.tasks) {
          return callback(templates);
        }
      }
    });
}

exports.toTemplate = function(req, res, next) {
  //TODO: save documents
  var templates = {},
    totals = {
      templates: 0,
      tasks: 0
    };
  var query = req.acl.mongoQuery('Task');
  query.findOne({
    _id: req.params.id,
    tType: {
      $ne: 'template'
    }
  })
    .exec(function(err, task) {
      if (err) {
        req.locals.error = err;
      } else {
        totals.tasks = 1;
        var watchers = req.body.watchers || [req.body.watcher];
        addRecorsiveTemplates(req.params.id, req.body.name, null, req.user._id, watchers, false, 'template', templates, totals, function(templates) {
          for (var t in templates) {
            templates[t].t.save();
          }
        });
      }
      req.locals.result = task;
      next();
    });
}

exports.toSubTasks = function(req, res, next) {
  //TODO: save documents
  var tasks = {},
    totals = {
      templates: 0,
      tasks: 0
    };
  var query = req.acl.mongoQuery('Task');
  query.findOne({
    _id: req.params.id,
    tType: 'template'
  }).exec(function(err, task) {
    if (err) {
      req.locals.error = err;
      next();
    } else {
      var query = req.acl.mongoQuery('Task');
      query.findOne({
        _id: req.body.taskId,
        tType: {
          $ne: 'template'
        }
      }).exec(function(err, task) {
        if (err) {
          req.locals.error = err;
          next();
        } else {
          totals.tasks = 1;
          addRecorsiveTemplates(req.params.id, req.body.name, null, req.user._id, [], req.body.taskId, null, tasks, totals, function(templates) {
            req.locals.result = [];
            for (var t in templates) {
              templates[t].t.save();
              if (templates[t].t.parent && templates[t].t.parent.toString() === req.body.taskId.toString()) {
                req.locals.result.push(templates[t].t);
              }
            }
            next();
          });
        }
      });
    }
  });
}

var deleteSubTask = function(req, subTasks) {
  for (var i = 0; i < subTasks.length; i++) {
    var query = req.acl.mongoQuery('Task');
    query.findOne({
      _id: subTasks[i],
      tType: 'template'
    }, function(err, template) {
      if (template) {
        deleteSubTask(req, template.subTasks);
        template.remove();
      }
    });
  }
}

exports.removeSubTask = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  deleteSubTask(req, req.locals.result.subTasks)
  next();
};