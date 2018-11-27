'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  archive = require('./archive.js'),
  modelUtils = require('./modelUtils'),
  config = require('meanio').loadConfig() ;

var DocumentSchema = new Schema({
  created: {
    type: Date
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
  status: {
    type: String,
    required: true,
    enum: ['new', 'in-progress', 'received', 'waiting-approval', 'done', 'sent'],
    default: 'new'
  },
  due: {
    type: Date
  },
  path: {
    type: String
  },
  spPath: {
    type: String
  },
  description: {
    type: String,
  },
  serial: { //Simuchin
    type: String
  },
  signBy: {
    type: Schema.ObjectId,
    ref: 'Signature'
  },
  tasks: [
    {
      type: Schema.ObjectId,
      ref: 'OfficeDocument'
    }
  ],
  folder: {
    type: Schema.ObjectId,
    ref: 'Folder'
  },
  id: {
    type: Schema.ObjectId
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
  assign: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  classification: {
    type: String
  },
  size: {
    type: Number
  },
  circles: {
    type: Schema.Types.Mixed
  },
  relatedDocuments: [
    {
      type: Schema.ObjectId,
      ref: 'Document'
    }
  ],
  tags: [
    {
      type: String,
      default: 'new'
    }
  ],
  documentType: {
    type: String
  },
  forNotice: [
    {
      type: Schema.ObjectId,
      ref: 'User',
      default: []
    }
  ],
  doneBy: [
    {
      type: Schema.ObjectId,
      ref: 'User',
      default: []
    }
  ],
  ref: {
    type: Schema.ObjectId
  },
  sentTo: [
    {
      date: Date,
      user: {
        type: Schema.ObjectId,
        ref: 'User',
      //        unique: true,
      }
    }
  ],
  readBy: [
    {
      date: Date,
      user: {
        type: Schema.ObjectId,
        ref: 'User',
      //        unique: true,
      }
    }
  ],
  viewed: Boolean,
  watchers: [
    {
      type: Schema.ObjectId,
      ref: 'User',
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
  folderIndex: {
    type: Number
  }
});

var starVirtual = DocumentSchema.virtual('star');
starVirtual.get(function() {
  return this._star;
});
starVirtual.set(function(value) {
  this._star = value;
});

/**
 * Validations
 */

/**
DocumentSchema.path('title').validate(function (title) {
  return !!title;
}, 'Name cannot be blank');
*/
/**
 * Statics
 */
DocumentSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('creator', 'name username').exec(cb);
};
DocumentSchema.statics.task = function(id, cb) {
  require('./task');
  var Task = mongoose.model('Task');
  Task.findById(id).populate('project').exec(function(err, task) {
    var result = {title: task.title};
    if(task.project) {
      result.room = task.project.room;
    }
    cb(err, result);
  });
};
DocumentSchema.statics.project = function(id, cb) {
  require('./project');
  var Project = mongoose.model('Project');
  Project.findById(id, function(err, project) {
    cb(err, {room: project.room, title: project.title});
  });
};

DocumentSchema.statics.discussion = function(id, cb) {
  require('./discussion');
  var Discussion = mongoose.model('Discussion');
  Discussion.findById(id, function(err, discussion) {
    cb(err, {room: discussion.room, title: discussion.title});
  });
};

DocumentSchema.statics.office = function(id, cb) {
  require('./office');
  var Office = mongoose.model('Office');
  Office.findById(id, function(err, office) {
    cb(err, {room: office.room, title: office.title});
  });
};

DocumentSchema.statics.folder = function(id, cb) {
  require('./folder');
  var Folder = mongoose.model('Folder');
  Folder.findById(id, function(err, folder) {
    cb(err, {room: folder.room, title: folder.title});
  });
};

var elasticsearch = require('../controllers/elasticsearch');

// Will not execute until the first middleware calls `next()`
DocumentSchema.pre('save', function(next) {
  let entity = this ;
  config.superSeeAll ? modelUtils.superSeeAll(entity,next) : next() ;
});


DocumentSchema.post('save', function(req, next) {
  var document = this;

  elasticsearch.save(document, 'officedocument');
  next();
});


DocumentSchema.pre('remove', function(next) {
  elasticsearch.delete(this, 'officedocument', next);
  next();
});

DocumentSchema.plugin(archive, 'officeDocument');

module.exports = mongoose.model('Document', DocumentSchema);
