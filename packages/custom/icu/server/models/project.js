'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');


var ProjectSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  title: {
    type: String
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  discussion: {
    type: Schema.ObjectId,
    ref: 'Discussion'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  manager: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  signature: {
    circles: {},
    codes: {}
  },
  color: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'canceled', 'completed', 'archived'],
    default: 'new'
  },
  description: {
    type: String
  },
  //should we maybe have finer grain control on this
  watchers: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  room: {
    type: String
  },
  sources: [String],
  circles: {
    type: Schema.Types.Mixed
  }
});

var starVirtual = ProjectSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});
ProjectSchema.set('toJSON', {
  virtuals: true
});
ProjectSchema.set('toObject', {
  virtuals: true
});

/**
 * Validations
 */
ProjectSchema.path('color').validate(function(color) {
  return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(color);
}, 'Invalid HEX color.');

/**
 * Statics
 */
ProjectSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};

/**
 * middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

ProjectSchema.post('save', function(req, next) {
  elasticsearch.save(this, 'project', this.room);
  next();
});

ProjectSchema.pre('remove', function(next) {
  elasticsearch.delete(this, 'project', this.room, next);
  next();
});

ProjectSchema.plugin(archive, 'project');

module.exports = mongoose.model('Project', ProjectSchema);