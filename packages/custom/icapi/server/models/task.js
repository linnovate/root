'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var TaskSchema = new Schema({
  created: {
    type: Date
  },
  updated: {
    type: Date
  },  
  title: {
    type: String,
    required: true    
  },
  project : {
    type: Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  parent : {
    type: Schema.ObjectId,
    ref: 'Task'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  manager: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Received', 'Completed']
  },
  due: {
    type: Date,
  },
  //should we maybe have finer grain control on this
  watchers : [{
    type: Schema.ObjectId,
    ref: 'User'
  }]
});

/**
 * Validations
 */
TaskSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

/**
 * Statics
 */
TaskSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};

mongoose.model('Tasks', TaskSchema);
