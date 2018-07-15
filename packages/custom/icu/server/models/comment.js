'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');


var CommentSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  task: {
    type: Schema.ObjectId,
    ref: 'Task',
    required: true
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

/**
 * Statics
 */
CommentSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};
CommentSchema.statics.task = function(id, cb) {
  require('./task');
  var Task = mongoose.model('Task');
  Task.findById(id).populate('project').exec(function(err, task) {
    if(!task) return cb(err, {});
    cb(err, task || {});
  });
};
/**
 * Post middleware
 */
var elasticsearch = require('../controllers/elasticsearch');
var mailManager = require('../controllers/mailManager');

CommentSchema.post('save', function(req, next) {
  var comment = this;
  CommentSchema.statics.task(this.task, function(err, task) {
    if(err) {
      return err;
    }
    elasticsearch.save(comment, 'comment');
    mailManager.send(comment, task);
  });
  next();
});

CommentSchema.pre('remove', function(next) {
  var comment = this;
  CommentSchema.statics.project(this.task, function(err, project) {
    if(err) {
      return err;
    }
    elasticsearch.delete(comment, 'comment', next);
  });
  next();
});

CommentSchema.plugin(archive, 'comment');

module.exports = mongoose.model('Comment', CommentSchema);
