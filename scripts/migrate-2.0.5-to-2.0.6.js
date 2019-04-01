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

const collMap = {
  task: 'tasks',
  project: 'projects',
  discussion: 'discussions',
  office: 'offices',
  folder: 'folders',
  officeDocument: 'documents',
  templateDoc: 'template_docs'
}

mongodb.connect(URL).then(client => {
  let db = client.db();
  let coll = db.collection(collection);

  coll.count({}, { limit }, (err, count) => {
    if(err) throw err;
    let bar = new ProgressBar(':bar', { total: count });

    let cursor = coll.find({}, { limit })
    cursor.forEach(doc => {

      // Skip if already migrated
      if(doc.updateField) {
        tick(bar, client);
        return;
      };

      let updated = switchMigrate(doc);

      if(!updated) {

        // Remove activity as we don't need it anymore
        coll.remove({ _id: doc._id }, (err) => {
          if(err) throw err;
          tick(bar, client);
        })
      } else if(!updated.updateField) {
        console.log('Coulndn\'t migrate', doc, updated)
      } else {

        // Check if entity refered by the activity exists
        db.collection(collMap[updated.entityType]).count({ _id: updated.entity}, (err, count) => {
          if(err) throw err;
          if(!count) {
            coll.remove({ _id: doc._id }, (err) => {
              if(err) throw err;
              tick(bar, client);
            })
          } else {
            coll.update({ _id: doc._id }, updated, (err, res) => {
              if(err) throw err;
              tick(bar, client);
            })
          }
        })
      }
    })
  })
})

function tick(bar, client) {
  bar.tick();
  if(bar.curr === bar.total) {
    client.close();
  }
}

function switchMigrate(doc) {

  if(doc.issue === 'officeDocuments') {
    doc.issue = 'officeDocument';
  }

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
      result.updateField = 'attachment';
      if(doc.description) {
        result.current = doc.description;
      }
      break;
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
