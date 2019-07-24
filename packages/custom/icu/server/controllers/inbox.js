"use strict";

var _ = require("lodash");
const HttpError = require("http-errors");

const modelsPath = "../models/";
const models = {
  task: require(modelsPath + "task"),
  discussion: require(modelsPath + "discussion"),
  project: require(modelsPath + "project"),
  office: require(modelsPath + "office"),
  folder: require(modelsPath + "folder"),
  officeDocument: require(modelsPath + "document"),
  templateDoc: require(modelsPath + "templateDoc"),
  user: require("../models/user.js")
};

function getUpdateEntities(req, res, next) {
  let activities = req.body;
  let allEntities = [];
  let allEntitiesIds = [];

  let Promises = [];

  for (let i in activities) {
    let activity = activities[i];
    let Model = models[activity.entityType];

    if (!Model) {
      console.error("No model for that entity type provided");
      continue;
    }
    Promises.push(
      new Promise((resolve, reject) => {
        if (_.includes(allEntitiesIds, activity.entity)) {
          activity.entityObj = allEntities.find(
            entity => entity._id === activity.entity
          );
          return resolve();
        }

        return Model.findOne({ _id: activity.entity })
          .populate("creator")
          .populate("watchers")
          .populate("project")
          .populate("folder")
          .populate("office")
          .then(doc => {
            if (!doc) return reject(new HttpError(404));

            activity.entityObj = doc;
            allEntities.push(doc);
            allEntitiesIds.push(doc._id.toString());
            return resolve(doc);
          });
      })
    );
  }
  Promise.all(Promises)
    .then(result => {
      return getAllUserObjects(activities);
    })
    .then(userObjects => {
      res
        .status(200)
        .send({
          activities: activities,
          entities: allEntities,
          users: userObjects
        });
    })
    .catch(err => {
      next(err);
    });
}

function getAllUserObjects(activities) {
  return new Promise(resolve => {
    let userArray = [];
    for (let activity of activities) {
      if (activity.updateField === "assign") userArray.push(activity.current);
    }
    if (userArray.length)
      return models.user.find(
        {
          _id: { $in: userArray }
        },
        (err, docs) => {
          if (err) console.error(err);
          return resolve(docs);
        }
      );
    return resolve([]);
  });
}

module.exports = {
  getUpdateEntities
};
