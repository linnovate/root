const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
var config = require("../config/env/all.js");

// run like so:
// MONGODB_URI_PORT='mongodb://localhost:27017' MONGODB_DB='icu-dev' node scripts/reset_permissions.js

// Connection URL
const url = process.env.MONGODB_URI_PORT || "mongodb://localhost:27017";

// Database Name
const dbName = process.env.MONGODB_DB || "icu";

const entityNames = [
  "tasks",
  "projects",
  "discussions",
  "templates",
  "offices",
  "folders",
  "documents",
  "template_docs"
];

const update_mongo_backward_203 = function(callback) {
  console.log("Running update_mongo_backward_203");

  MongoClient.connect(url, function(err, client) {
    // Use connect method to connect to the server
    // assert.equal(null, err);
    if (err) {
      console.log("Connection error to server");
      return err;
    }

    console.log("Connected successfully to server");
    const db = client.db(dbName);

    // begin proc
    resetPermissions(db, function() {
      console.log("done resetPermissions.");
    }).then(function() {
      setPermissions(db, function() {}).then(function() {
        connectionClose(client);
      });
    });
  });
};

const connectionClose = function(client) {
  console.log("Connection terminated.");
  client.close();
};

update_mongo_backward_203();

const resetPermissions = function(db, callback) {
  console.log("begin resetPermissions.");
  var promises = [];
  entityNames.forEach(function(entityName) {
    console.log("resetting permissions for ", entityName);
    const collection = db.collection(entityName);
    return promises.push(
      new Promise(function(resolve, error) {
        collection.find().forEach(
          function(elem) {
            //  console.log(elem) ;
            collection.update(
              {
                _id: elem._id
              },
              {
                $unset: {
                  permissions: ""
                }
              }
            );
          },
          function(err, res) {
            if (err) {
              console.log("error setPermissions for ", entityName);
            } else {
              console.log("done resetPermissions for ", entityName);
            }
            resolve(res);
          }
        );
      })
    );
  }); // end outer

  return Promise.all(promises).then(function() {
    console.log("done resetPermissions for all");
  });
};

const setPermissions = function(db, callback) {
  console.log("begin setPermissions.");
  var promises_set = [];
  const levels = ["editor", "commenter", "viewer"];
  entityNames.forEach(function(entityName) {
    console.log("begin setting permissions for ", entityName);
    const collection = db.collection(entityName);
    return promises_set.push(
      new Promise(function(resolve, error) {
        collection.find().forEach(
          function(elem) {
            //console.log(elem.watchers) ;
            var level = null;
            const permsPerEntity = elem.watchers.map(watcher => {
              // console.log("watcher:",watcher) ;
              // console.log("creator:",elem.creator ? elem.creator.valueOf() : 'no creator') ;
              // console.log("assign:",elem.assign ? elem.assign.valueOf() : 'no assignee') ;

              if (
                elem.creator &&
                elem.creator.valueOf().toString() == watcher
              ) {
                level = levels[0];
              } else if (
                elem.assign &&
                elem.assign.valueOf().toString() == watcher
              ) {
                level = levels[1];
              } else {
                level = levels[2];
              }
              return {
                id: watcher,
                level: level
              };
            });

            // console.log("permsPerEntity:",permsPerEntity) ;

            collection.update(
              {
                _id: elem._id
              },
              {
                $set: {
                  permissions: permsPerEntity
                }
              }
            );
          },
          function(err, res) {
            if (err) {
              console.log("error setPermissions for ", entityName);
            } else {
              console.log("done setPermissions for ", entityName);
            }
            resolve(res);
          }
        );
      })
    );
  }); // end outer

  return Promise.all(promises_set).then(function() {
    console.log("done setting permissions for all");
  });
};
