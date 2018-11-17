const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = ('mongodb://localhost:27017');
// Database Name
const dbName = ('icu-dev');
// Model Name
const entityName = 'updates';

update_mongo_206();

function update_mongo_206() {
  console.log("Running updating 2.0.6 activities");

  MongoClient.connect(url,(err, client) => {
    // Use connect method to connect to the server
    if (err) {
      console.log("Connection error to server");
      return err;
    }

    console.log("Connected successfully to server");
    const db = client.db(dbName);

    // begin process
    updateActivities(db,() => { console.log("done updating activities") })
    .then(() => resetUnusedActivitiesParams(db,() => { console.log("done reset unused activities parameters") }) )
    .then(() => connectionClose(client))
  })
}

const connectionClose = client => {
  console.log("Connection terminated.");
  client.close();
};

const updateActivities = db => {
  console.log("begin updateActivities.");

  const collection = db.collection(entityName);
  return new Promise( resolve => {
      collection.find()
        .forEach(elem => {
          collection.update(
            {
              _id: elem._id
            },
            {
              $set: {
                date: elem.created,
                entity: elem.issueId,
                entityType: elem.issue,
                updateField: elem.type,
                current: elem.status,
              }
            }
          );
        },(err, res) => {
          if(err)console.log("error updating activity for ", entityName);
          else
            console.log("done updating activity for ", entityName);
          return resolve(res);
        })
    })
};

const resetUnusedActivitiesParams = db => {
  return new Promise( resolve => {
    console.log("begin reset activities");

    const collection = db.collection(entityName);
    collection.find()
      .forEach(elem => {
        console.log(elem);
        collection.update(
          {
            _id: elem._id
          },
          {
            $unset: {
              description: "",
              taskDue: "",
              color: "",
              watcher: "",
              miscData: "",
              userObj: "",
              created: "",
              issue: "",
              issueId: "",
              type: "",
              status: "",
            }
          }
        );
      },(err, res) => {
        if(err) console.log("error resetActivities for ", entityName);
        else
          console.log("done resetActivities for ", entityName);
        console.log("done resetActivities for all");
        return resolve(res);
      });

  })
};
