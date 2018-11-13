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
  updateField: {
      type: String,
      enum: [
          'create',
          'due', 'status', 'assign', 'location', 'color',
          'title', 'description', 'comment', 'attachment',
          'watchers',
      ]
  },
  date: {
    type: Date
  },
  prev: {
    type: Schema.Types.Mixed
  },
  current: {
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

  checkAndNotify(update);

  next();
});

function checkAndNotify(update) {

  let { entityType } = update;

  // Check if update is important
  if(![
    'comment',
    'assign',
    'due',
    'status'
  ].includes(update.updateField)) return;

  let modelName = entityType[0].toUpperCase() + entityType.slice(1);

  mongoose.model('Update')
  .populate(update, [{
    path: 'creator',
    select: 'name username'
  }, {
    path: 'entity',
    model: modelName
  }], (err, doc) => {
    console.log('################################################################')
    console.log('############################ RESULT ############################')
    console.log('################################################################')
    console.log(update)

    if(err) {
      console.log('population error')
      console.log(err)
      return;
    };

    let { entity, creator } = update;

    // Check if there is assignee
    if(!entity || !entity.assign) {
      console.log('no assignee');
      return;
    };

    // Skip if assignee by himself created the update
    if(creator._id.equals(entity.assign)) {
      console.log('assignee himself updated');
      return;
    };
    socket.notify(entity.assign.toString(), update);
  })
}

UpdateSchema.pre('remove', function(next) {
  elasticsearch.delete(this, 'update', next);
  next();
});

UpdateSchema.plugin(archive, 'update');

module.exports = mongoose.model('Update', UpdateSchema);
