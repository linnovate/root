'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');

var AttachmentSchema = new Schema({
  created: {
    type: Date
  },
  updated: {
    type: Date
  },
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  attachmentType: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    required: true
  },
  issueId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  updater: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  size: {
    type: Number
  },
  circles: {
    type: Schema.Types.Mixed
  },
  watchers: [{
    type: Schema.ObjectId,
    ref: 'User'
  }]
});

/**
 * Validations
 */
AttachmentSchema.path('name').validate(function (name) {
  return !!name;
}, 'Name cannot be blank');

AttachmentSchema.path('issue').validate(function (issue) {
  return !!issue;
}, 'Issue cannot be blank');

AttachmentSchema.path('issueId').validate(function (issueId) {
  return !!issueId;
}, 'Issue id cannot be blank');

/**
 * Statics
 */
AttachmentSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};
AttachmentSchema.statics.task = function (id, cb) {
  require('./task');
  var Task = mongoose.model('Task');
  Task.findById(id).populate('project').exec(function (err, task) {
    var result = {title: task.title};
    if (task.project) {
      result.room = task.project.room;
    }
    cb(err, result);
  });
};
AttachmentSchema.statics.project = function (id, cb) {
  require('./project');
  var Project = mongoose.model('Project');
  Project.findById(id, function (err, project) {
    cb(err, {room: project.room, title: project.title});
  });
};
// AttachmentSchema.statics.update = function (id, cb) {
//   cb(null, {});
// };

/**
 * Post middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

AttachmentSchema.post('save', function (req, next) {
  var attachment = this;
  AttachmentSchema.statics[attachment.entity](attachment.entityId, function (err, result) {
    if (err) {
      return err;
    }
    elasticsearch.save(attachment, 'attachment', result.room, result.title);
    next();
  });

});

AttachmentSchema.pre('remove', function (next) {
  elasticsearch.delete(this, 'attachment', this.room, next);
  next();
});

AttachmentSchema.plugin(archive, 'attachment');

module.exports = mongoose.model('Attachment', AttachmentSchema);
