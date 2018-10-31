'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js'),
  socket = require('../../../mean-socket/server');

const UpdateSchema = new Schema({
  entity: {
    type: String
  },
  entityType: {
    type: String,
    enum: [
      'task', 'project', 'discussion', 'officeDocument',
      'folder', 'office', 'templateDocument'
    ]
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    enum: [
      'create', 'update', 'delete'
    ]
  },
  updateField: {
      type: String,
      enum: [
          'due', 'status', 'assign', 'location',
          'title', 'description', 'comment', 'attachment',
          'watcher',
      ]
  },
  prev: {
    type: Schema.Types.Mixed
  },
  new: {
    type: Schema.Types.Mixed
  }
});

var attachmentsVirtual = UpdateSchema.virtual('attachments');
attachmentsVirtual.get(function() {
  return this._attachments;
});
attachmentsVirtual.set(function(value) {
  this._attachments = value;
});
UpdateSchema.set('toJSON', {virtuals: true});
UpdateSchema.set('toObject', {virtuals: true});

/**
 * Validations
 */
UpdateSchema.path('entity').validate(function(entity) {
  return !!entity;
}, 'Entity cannot be blank');

UpdateSchema.path('entityType').validate(function(entityType) {
  return !!entityType;
}, 'Entity type id cannot be blank');

/**
 * Statics
 */
UpdateSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};

UpdateSchema.statics.task = function(id, cb) {
  require('./task');
  var Task = mongoose.model('Task');
  Task.findById(id).populate('project').exec(function(err, task) {
    cb(err, {room: task.project ? task.project.room : null, title: task.title});
  });
};

UpdateSchema.statics.project = function(id, cb) {
  require('./project');
  var Project = mongoose.model('Project');
  Project.findById(id, function(err, project) {
    cb(err, {room: project.room, title: project.title});
  });
};

UpdateSchema.statics.office = function(id, cb) {
  require('./office');
  var Office = mongoose.model('Office');
  Office.findById(id, function(err, office) {
    cb(err, {room: office.room, title: office.title});
  });
};

UpdateSchema.statics.folder = function(id, cb) {
  require('./folder');
  var Folder = mongoose.model('Folder');
  Folder.findById(id, function(err, folder) {
    cb(err, {room: folder.room, title: folder.title});
  });
};

/**
 * Post middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

UpdateSchema.post('save', function(req, next) {
  var update = this;
  socket.notify(req.userObj, req);
  if(UpdateSchema.statics[update.issue]) {
    UpdateSchema.statics[update.issue](update.issueId, function(err, result) {
      if(err) {
        return err;
      }
      elasticsearch.save(update, 'update');
    });
  }
  else {
    elasticsearch.save(update, 'update');
  }

  next();
});

UpdateSchema.pre('remove', function(next) {
  elasticsearch.delete(this, 'update', next);
  next();
});

UpdateSchema.plugin(archive, 'update');

module.exports = mongoose.model('Update', UpdateSchema);
