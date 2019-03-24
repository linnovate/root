const path = require('path');
const mongodb = require('mongodb');
const ProgressBar = require('progress');

const URL = process.env.MONGODB_URI || process.argv[2];
if(!URL) {
  console.log(`Usage: node ${path.basename(__filename)} mongodb://<host>:<port>/<db>`)
  process.exit(1)
}
const collection = 'updates';

const limit = undefined;

mongodb.connect(URL).then(client => {
  let db = client.db();
  let coll = db.collection(collection);

  coll.count({}, { limit }, (err, count) => {
    if(err) throw err;
    let bar = new ProgressBar(':bar', { total: count });

    let cursor = coll.find({}, { limit })
    cursor.forEach(doc => {

      // Skip if already migrated
      if(doc.updateField) return;

      let updated = switchMigrate(doc);

      if(!updated) {
        coll.remove({ _id: doc._id }, (err) => {
          if(err) throw err;
        })
      } else if(!updated.updateField) {
        console.log('Coulndn\'t migrate', doc, updated)
      } else {
        coll.update({ _id: doc._id }, updated, (err, res) => {
          if(err) throw err;
          // console.log(doc._id, res.result);
        })
      }
      bar.tick();
    }, client.close.bind(client))
  })

})

let updateFieldMap = {
  assign: 'assign',
  assignNew: 'assign',
  comment: 'comment',
  create: 'create',
  document: 'attachment',
  documentDelete: 'attachment',
  removeWatcher: 'watcher',
  unassign: 'assign',
  update: '',
  updateColor: 'color',
  updateCreated: '',
  updateDescription: 'description',
  updateDue: 'due',
  updateEntity: '',
  updateLocation: 'location',
  updateNewDescription: 'description',
  updateNewEntity: '',
  updateNewLocation: 'location',
  updateNewTitle: 'title',
  updateStatus: 'status',
  updateTitle: 'title',
  updateWatcher: 'watcher',
  updateWatcherPerms: 'watcher'
};

function migrate(doc) {
  let {
    creator,
    issueId,
    issue,
    type,
    created,
    status,
    prev,
    entity,
    entityType,
    updateField,
    date,
    current
  } = doc;

  return {
    creator: creator,
    entity: issueId || entity,
    entityType: issue || entityType,
    updateField: updateFieldMap[type] || updateField,
    date: created || date,
    current: status || current,
    prev: prev
  }
}

function switchMigrate(doc) {

  let result = {
    creator: doc.creator,
    date: doc.created,
    entity: doc.issueId,
    entityType: doc.issue
  };

  switch(doc.type) {
    case 'assign':
    case 'assignNew':
    case 'unassign':
      result.updateField = 'assign';
      result.current = doc.userObj; // ObjectID user._id
      if(doc.prev) result.prev = doc.prev; // String user.name
      break;
    case 'comment':
      result.updateField = 'comment';
      result.current = doc.description;
      break;
    case 'create':
      result.updateField = 'create';
      break;
    case 'updateDescription':
    case 'updateNewDescription':
      result.updateField = 'description';
      result.current = doc.status;
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'updateColor':
      result.updateField = 'color';
      result.current = doc.status;
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'updateDue':
      result.updateField = 'due';
      result.current = doc.TaskDue;
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'updateLocation':
    case 'updateNewLocation':
      result.updateField = 'location';
      result.current = doc.status;
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'updateStatus':
      result.updateField = 'status';
      result.current = doc.status;
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'updateTitle':
    case 'updateNewTitle':
      result.updateField = 'title';
      result.current = doc.status;
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'updateWatcher':
    case 'removeWatcher':
      result.updateField = 'watchers';
      result.current = doc.userObj;
      break;
    case 'updateStartDue':
      result.updateField = 'deadline';
      result.current = {
        startDate: doc.TaskDue
      };
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'updateEndDue':
      result.updateField = 'deadline';
      result.current = {
        endDate: doc.TaskDue
      };
      if(doc.prev) result.prev = doc.prev;
      break;
    case 'document':
    case 'documentDelete':
    case 'updateEntity':
    case 'updateNewEntity':
    case 'updateWatcherPerms':
      // In case of `updateWatcherPerms`, check the following field
      //doc.permissions;
    default:
      // Delete this item by returning false
      return false;
  }

  return result;
}
