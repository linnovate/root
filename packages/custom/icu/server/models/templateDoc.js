'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');

var TemplateDocSchema = new Schema({
  created: {
    type: Date
  },
  title: {
    type: String
  },
  path: {
    type: String
  },
  spPath:{
    type:String
  },
  description: {
    type: String
  },
  templateType: { //docx,pptx,xlsx
    type: String
  },
  office: {
    type: Schema.Types.ObjectId,
    ref:'Office'
  },
  creator: {
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
},{collection: 'template_docs'});



/**
TemplateDocSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};


 * Validations


TemplateDocSchema.path('name').validate(function (name) {
  return !!name;
}, 'Name cannot be blank');

/**
 * Statics
 
TemplateDocSchema.statics.load = function (id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};
TemplateDocSchema.statics.task = function (id, cb) {
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
TemplateDocSchema.statics.project = function (id, cb) {
  require('./project');
  var Project = mongoose.model('Project');
  Project.findById(id, function (err, project) {
    cb(err, {room: project.room, title: project.title});
  });
};

TemplateDocSchema.statics.discussion = function (id, cb) {
  require('./discussion');
  var Discussion = mongoose.model('Discussion');
  Discussion.findById(id, function (err, discussion) {
    cb(err, {room: discussion.room, title: discussion.title});
  });
};

TemplateDocSchema.statics.office = function (id, cb) {
  require('./office');
  var Office = mongoose.model('Office');
  Office.findById(id, function (err, office) {
    cb(err, {room: office.room, title: office.title});
  });
};

TemplateDocSchema.statics.folder = function (id, cb) {
  require('./folder');
  var Folder = mongoose.model('Folder');
  Folder.findById(id, function (err, folder) {
    cb(err, {room: folder.room, title: folder.title});
  });
};

var elasticsearch = require('../controllers/elasticsearch');

TemplateDocSchema.post('save', function (req, next) {
  var attachment = this;
  TemplateDocSchema.statics[attachment.entity](attachment.entityId, function (err, result) {
    if (err) {
      return err;
    }
    elasticsearch.save(attachment, 'templateDoc', result.room, result.title);
    next();
  });

});

TemplateDocSchema.pre('remove', function (next) {
  elasticsearch.delete(this, 'templateDocSchema', this.room, next);
  next();
});

*/

TemplateDocSchema.plugin(archive, 'templateDoc');

module.exports = mongoose.model('TemplateDoc', TemplateDocSchema);
