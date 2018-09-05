'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js'),
  request = require('request'),
  userSchema = require('./user'),
  modelUtils = require('./modelUtils'),
  config = require('meanio').loadConfig() ;

var TaskSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  recycled: {
    type: Date,
  },
  title: {
    type: String
  },
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  manager: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['new', 'assigned', 'in-progress', 'waiting-approval', 'review', 'rejected', 'done'],
    default: 'new'
  },
  due: {
    type: Date
  },
  //should we maybe have finer grain control on this
  watchers: [
    {
      type: Schema.ObjectId,
      ref: 'User'
    }
  ],
  bolded: [
    {
      _id: false,
      id: {type: Schema.ObjectId, ref: 'User'},
      bolded: Boolean,
      lastViewed: Date
    }
  ],
  permissions: [
    {
      _id: false,
      id: {type: Schema.ObjectId, ref: 'User'},
      level: {
        type: String,
        enum: ['viewer', 'commenter', 'editor'],
        default: 'viewer'
      }
    }
  ],

  assign: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  description: {
    type: String
  },
  discussions: [
    {
      type: Schema.ObjectId,
      ref: 'Discussion'
    }
  ],
  sources: [String],
  circles: {
    type: Schema.Types.Mixed
  },
  subTasks: [
    {
      type: Schema.ObjectId,
      ref: 'Task'
    }
  ],
  parent: {
    type: Schema.ObjectId,
    ref: 'Task'
  },
  templateId: {
    type: Schema.ObjectId,
    ref: 'Task'
  },
  custom: {
    id: {
      type: String,
      index: true
    },
    type: {
      type: String,
    },
    data: {}
  }
});

var starVirtual = TaskSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});
TaskSchema.set('toJSON', {
  virtuals: true
});
TaskSchema.set('toObject', {
  virtuals: true
});

/**
 * Statics
 */
TaskSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username')
    .populate('assign', 'name username').exec(cb);
};
TaskSchema.statics.project = function(id, cb) {
  require('./project');
  var Project = mongoose.model('Project');
  Project.findById(id, function(err, project) {
    cb(err, project || {});
  });
};
/**
 * Post middleware
 */
var elasticsearch = require('../controllers/elasticsearch');

// TaskSchema.methods.updatePerms = function updatePerms (cb) {
//   var creator = {id: '5aa506a9e38f521c17e7fbea' , level: "editor"}   ;
//   this.update(
//       {},
//     { $addToSet: { permissions: creator } }
//  )
// };


TaskSchema.post('save', function(req, next) {
  var task = this;

  TaskSchema.statics.project(this.project, function(err, project) {
    if(err) {
      return err;
    }

    elasticsearch.save(task, 'task');
  });
  next();
});


// Will not execute until the first middleware calls `next()`
TaskSchema.pre('save', function(next) {
  let entity = this ;
  config.superSeeAll ? modelUtils.superSeeAll(entity,next) : next() ;
});


TaskSchema.pre('remove', function(next) {
  var task = this;
  TaskSchema.statics.project(this.project, function(err, project) {
    if(err) {
      return err;
    }
    elasticsearch.delete(task, 'task', next);
  });
  next();
});


TaskSchema.plugin(archive, 'task');

var deepPopulate = require('mongoose-deep-populate')(mongoose);
TaskSchema.plugin(deepPopulate, {});

module.exports = mongoose.model('Task', TaskSchema);
