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
var Attachment = require('../models/attachment');
var Update = require('../models/update');

Object.keys(template).forEach(function(methodName) {
  if (methodName !== 'create') {
    exports[methodName] = template[methodName];
  }
});

var addAttachment = function(tAttachment, templateId, creator, watchers, circles) {
	Update.findOne({_id: tAttachment.issueId}).exec(function(err, tUpdate) {
	  addUpdate(templateId, creator, 'copyAttachment', tUpdate.description, function(err, update) {
	    if(err) {
	      console.log(err)
	      return;
	    }
	    var attachment = new Attachment({
	      issueId: update._id,
	      issue: 'update',
	      entity: 'task',
	      entityId: templateId,
	      name: tAttachment.name,
	      path: tAttachment.path,
	      attachmentType: tAttachment.attachmentType,
	      size: tAttachment.size,
	      created: new Date(),
	      updated: new Date(),
	      creator: creator,
	      watchers: watchers,
	      circles: circles
	    });
	    attachment.save();
	  });
  	});
};

var cloneAttachments = function(taskId, templateId, creator, watchers, circles) {
  Attachment.find({
    entity: 'task',
    entityId: taskId
  }).exec(function(err, attachments) {
    for (var i = 0; i < attachments.length; i++) {
      addAttachment(attachments[i], templateId, creator, watchers, circles);
    }
  });
};

var addUpdate = function(taskId, creator, type, description, callback) {
  var update = new Update({
    issue: 'task',
    issueId: taskId,
    creator: creator,
    type: type,
    description: description,
    created: new Date(),
    updated: new Date()
  });
  update.save(function(err, update) {
    if (callback) {
      callback(err, update);
    }
  });
};

var addToTemplate = function(task, parentId, name, creator, watchers, circles, project, exist, tType, callback) {
  if (!exist) {
    var template = new Task({
      tType: tType,
      title: name || task.title,
      parent: parentId,
      creator: creator,
      tags: task.tags,
      description: task.description,
      watchers: watchers,
      circles: circles,
      project: project,
      templateId: task._id
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

var addRecorsiveTemplates = function(taskId, name, parentId, creator, watchers, circles, project, exist, tType, templates, totals, callback) {
  Task.findOne({
    '_id': taskId
  })
    .exec(function(err, task) {
      if (task) {
        totals.tasks += task.subTasks.length;
        addToTemplate(task, parentId, name, creator, watchers, circles, project, exist, tType, function(template) {
          templates[template.t._id] = template;
          if (parentId) {
            templates[parentId].t.subTasks.push(template.t._id);
          }
          totals.templates++;
          if (totals.templates === totals.tasks) {
            return callback(templates);
          }
          watchers = template.t.watchers;
          circles = template.t.circles;
          project = template.t.project;
          for (var i = 0; i < task.subTasks.length; i++) {
            addRecorsiveTemplates(task.subTasks[i], null, template.t._id, creator, watchers, circles, project, false, tType, templates, totals, callback);
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
        var circles = req.body.circles;
        addRecorsiveTemplates(req.params.id, req.body.name, null, req.user._id, watchers, circles, null, false, 'template', templates, totals, function(templates) {
          var counter = Object.keys(templates).length;
          for (var t in templates) {
            templates[t].t.save(function(err, subtask) {
	            counter--;
              if (counter === 0) {
                for (var t in templates) {
                  cloneAttachments(templates[t].t.templateId , t , req.user._id, watchers, circles);
                }
              };
            });
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
          addRecorsiveTemplates(req.params.id, req.body.name, null, req.user._id, [], {}, null, req.body.taskId, null, tasks, totals, function(templates) {
            req.locals.result = [];
            for (var t in templates) {
              templates[t].t.save(function(err, subtask) {
                addUpdate(subtask._id, req.user, 'copy');
                cloneAttachments(subtask.templateId, subtask._id , req.user._id, subtask.watchers, subtask.circles);
              });
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