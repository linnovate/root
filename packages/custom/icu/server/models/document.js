'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');

var DocumentSchema = new Schema({
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
  description: {
    type: String,
  },
  serial:{ //Simuchin
    type:String
  },
  documentType: { //docx,pptx,xlsx
    type: String,
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
  sender: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  sendingAs: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  asign:{
    type: Schema.ObjectId,
    ref: 'User'
  },
  classification: {
    type:String
  },
  size: {
    type: Number
  },
  circles: {
    type: Schema.Types.Mixed
  },
  relatedDocuments: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],

  watchers: [{
    type: Schema.ObjectId,
    ref: 'User'
  }]
});



/**
 * Validations
 */
DocumentSchema.path('name').validate(function (name) {
  return !!name;
}, 'Name cannot be blank');

/**
 * Statics
 */
DocumentSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};
DocumentSchema.statics.task = function (id, cb) {
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
DocumentSchema.statics.project = function (id, cb) {
  require('./project');
  var Project = mongoose.model('Project');
  Project.findById(id, function (err, project) {
    cb(err, {room: project.room, title: project.title});
  });
};

DocumentSchema.statics.discussion = function (id, cb) {
  require('./discussion');
  var Discussion = mongoose.model('Discussion');
  Discussion.findById(id, function (err, discussion) {
    cb(err, {room: discussion.room, title: discussion.title});
  });
};

DocumentSchema.statics.office = function (id, cb) {
  require('./office');
  var Office = mongoose.model('Office');
  Office.findById(id, function (err, office) {
    cb(err, {room: office.room, title: office.title});
  });
};

var elasticsearch = require('../controllers/elasticsearch');

DocumentSchema.post('save', function (req, next) {
  var attachment = this;
  DocumentSchema.statics[attachment.entity](attachment.entityId, function (err, result) {
    if (err) {
      return err;
    }
    elasticsearch.save(attachment, 'attachment', result.room, result.title);
    next();
  });

});

DocumentSchema.pre('remove', function (next) {
  elasticsearch.delete(this, 'attachment', this.room, next);
  next();
});

DocumentSchema.plugin(archive, 'attachment');

module.exports = mongoose.model('Document', DocumentSchema);
