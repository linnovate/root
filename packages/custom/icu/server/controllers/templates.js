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
  if(methodName !== 'create') {
    exports[methodName] = template[methodName];
  }
});

var addAttachment = function(tAttachment, templateId, creator, watchers, circles) {
  Update.findOne({_id: tAttachment.issueId}).exec(function(err, tUpdate) {
    addUpdate(templateId, creator, 'copyAttachment', tUpdate.description, function(err, update) {
      if(err) {
        console.log(err);
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
    for(var i = 0; i < attachments.length; i++) {
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
  update.save(function (err, update) {
    if (callback) {
      callback(err, update);
    }
  });
};

var addToTemplate = function (task, due, parentId, name, creator, watchers, circles, project, exist, tType, office, folder, custom, callback) {
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
      office: office,
      folder: folder,
      templateId: task._id,
      assign: task.assign,
      status: task.status,
      due: due,
      custom: custom
    });

    callback({
      s: task.subTasks.length,
      t: template
    });
  }
  else {
    Task.findOne({
      _id: exist
    }).exec(function(err, existTask) {
      if(err) {
        console.log(err);
      }
      callback({
        s: task.subTasks.length,
        t: existTask
      });
    });
  }
};

var addRecorsiveTemplates = function (taskId, name, parentId, creator, watchers, circles, project, exist, tType, templates, totals, created, office, folder, customId, callback) {
  Task.findOne({
    _id: taskId
  })
    .populate('subTasks')
    .exec(function (err, task) {
      if (task) {
        totals.tasks += task.subTasks.length;
        var due = task.due;
        if (!tType && task.due) {
          var timeDiff = Math.abs(task.due.getTime() - created.getTime());
          var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
          var date = new Date();
          date = new Date(date.setDate(new Date().getDate() + diffDays));
          due = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        }

        let custom;
        if (task.custom && task.custom.id) custom = task.custom;
        else if (customId && task.tType === 'template' && parentId != null) {
          let generatedCustomId = customId + task.title.replace(/\s+/g, "").toLowerCase(),
            generatedCustomType = 'subTask';
          const idx = task.tags.findIndex(t => t.includes('type:'));
          if (idx !== -1) {
            const tag = task.tags[idx];
            const valArr = tag.split(':');
            if (valArr.length > 0) generatedCustomType = valArr[1];
            task.tags.splice(idx, 1);
          }

          custom = {
            id: generatedCustomId,
            type: generatedCustomType
          }
        }
        addToTemplate(task, due, parentId, name, creator, watchers, circles, project, exist, tType, office, folder, custom, function (template) {
          let customIdExists = false;
          if (template.t.custom && template.t.custom.id && template.t.custom.type) {
            const findIdxPredicate = t => {
              return t.custom && t.custom.id && t.custom.type &&
                t.custom.id === template.t.custom.id && t.custom.type === template.t.custom.type;
            }
            let idx = Object.values(templates).findIndex(findIdxPredicate);
            if (idx !== -1) {
              customIdExists = true;
            }
            if (parentId != null && templates[parentId] && templates[parentId].subTasks) {
              idx = templates[parentId].subTasks.findIndex(findIdxPredicate);
              if (idx !== -1) {
                customIdExists = true;
              }
            }
          }

          let templateId = {
            _id: template.t._id
          };
          if (template.t.custom && template.t.custom.id && template.t.custom.type) {
            templateId.custom = {
              id: template.t.custom.id,
              type: template.t.custom.type
            };
          }

          if (customId == null || !customIdExists) {
            templates[template.t._id] = template;
            if (parentId) {
              templates[parentId].t.subTasks.push(template.t._id);
              if(!templates[parentId].subTasks) templates[parentId].subTasks = [];
              templates[parentId].subTasks.push(templateId);
            }
            totals.templates++;
          }
          if (totals.templates === totals.tasks) {
            return returnTemplates();
          }
          watchers = template.t.watchers;
          circles = template.t.circles;
          project = template.t.project;
          office = template.t.office;
          folder = template.t.folder;

          for (var i = 0; i < task.subTasks.length; i++) {
            addRecorsiveTemplates(task.subTasks[i]._id, null, template.t._id, creator, watchers, circles, project, false, tType, templates, totals, created, office, folder, customId, callback);
          }
        });
      }
      else {
        totals.templates++;
        if (totals.templates === totals.tasks) {
          return returnTemplates();
        }
      }
    });

  function returnTemplates() {
    templates = Object.values(templates).map(template => {
      return {
       t: template.t,
       s: template.s 
      }
    });
    return callback(templates);
  }
};

exports.toTemplate = function (req, res, next) {
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
    .exec(function (err, task) {
      if (err) {
        req.locals.error = err;
      }
      else {
        totals.tasks = 1;
        var watchers = req.body.watchers || [req.body.watcher];
        var circles = req.body.circles;
        addRecorsiveTemplates(req.params.id, req.body.name, null, req.user._id, watchers, circles, null, false, 'template', templates, totals, null, null, null, null, function (templates) {
          var counter = Object.keys(templates).length;
          for (var t in templates) {
            templates[t].t.save(function (err, subtask) {
              if (subtask.templateId.toString() === task._id.toString()) {
                req.locals.result = subtask;
                next();
              }
              counter--;
              if (counter === 0) {
                for (var t in templates) {
                  cloneAttachments(templates[t].t.templateId, t, req.user._id, watchers, circles);
                }
              }
            });
          }
        });
      }
    });
};

exports.toSubTasks = function(req, res, next) {
  var cb = arguments[3];
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
    if(err) {
      req.locals.error = err;
      if(cb) return cb(err); else next();
    } if(!task) {
      req.locals.error = new Error('No template.');
      if(cb) return cb('No template.'); else next();
    }
    else {
      var created = task.created;
      var query = req.acl.mongoQuery('Task');
      query.findOne({
        _id: req.body.taskId,
        tType: {
          $ne: 'template'
        }
      }).exec(function (err, task) {
        if (err) {
          req.locals.error = err;
          if (cb) return cb(err); else next();
        }
        else {
          totals.tasks = 1;
          addRecorsiveTemplates(req.params.id, req.body.name, null, req.user._id, [], {}, null, req.body.taskId, null, tasks, totals, created, null, null, req.body.custom.id, function (templates) {
            req.locals.result = [];
            for (var t in templates) {
              templates[t].t.save(function (err, subtask) {
                if (typeof subtask != 'undefined') { // TBD - need to check why we have empties
                  addUpdate(subtask._id, req.user, 'copy');
                  cloneAttachments(subtask.templateId, subtask._id, req.user._id, subtask.watchers, subtask.circles);
                }
              });
              if (templates[t].t.parent && templates[t].t.parent.toString() === req.body.taskId.toString()) {
                req.locals.result.push(templates[t].t);
              }
            }
            if (cb) return cb(null, req.locals.result); else next();
          });
        }
      });
    }
  });
};

var deleteSubTask = function(req, subTasks) {
  for(var i = 0; i < subTasks.length; i++) {
    var query = req.acl.mongoQuery('Task');
    query.findOne({
      _id: subTasks[i],
      tType: 'template'
    }, function(err, template) {
      if(template) {
        deleteSubTask(req, template.subTasks);
        template.remove();
      }
    });
  }
};

exports.removeSubTask = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  deleteSubTask(req, req.locals.result.subTasks);
  next();
};
