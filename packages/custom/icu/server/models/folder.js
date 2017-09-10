'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js');


var FolderSchema = new Schema({
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
    ref: 'Office'
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
  hasRoom: {
    type: Boolean,
    default: false
  },
  sources: [String],
  circles: {
    type: Schema.Types.Mixed
  },
  WantRoom: {
    type: Boolean,
    default: false
  }
});

var starVirtual = FolderSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});
FolderSchema.set('toJSON', {
  virtuals: true
});
FolderSchema.set('toObject', {
  virtuals: true
});

/**
 * Validations
 */
FolderSchema.path('color').validate(function(color) {
  return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(color);
}, 'Invalid HEX color.');

/**
 * Statics
 */
FolderSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};

/**
 * middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

FolderSchema.post('save', function(req, next) {
  elasticsearch.save(this, 'folder', this.room);
  next();
});

FolderSchema.pre('remove', function(next) {
  elasticsearch.delete(this, 'folder', this.room, next);
  next();
});

FolderSchema.plugin(archive, 'folder');

module.exports = mongoose.model('Folder', FolderSchema);