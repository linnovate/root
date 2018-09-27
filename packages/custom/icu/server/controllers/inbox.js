'use strict';

var _ = require('lodash');
const httpError = require('http-errors');

const models = {
    task: require('../models/task'),
    discussion: require('../models/discussion'),
    project: require('../models/project'),
    office: require('../models/office'),
    folder: require('../models/folder'),
    officeDocument: require('../models/document'),
    templateDoc: require('../models/templateDoc')
};

module.exports = {
    getUpdateEntities,
}
//    if(!docs.length) throw new httpError(404);

function getUpdateEntities(req, res, next) {
    let entities = req.body;
    let allEntities = [];
    let Promises = [];

    for(let entityType in entities) {
        if(!entities[entityType].length)continue;
        let Model = models[entityType];

        Promises.push(
            new Promise( resolve => {
                return Model.find({ _id: { $in: entities[entityType] } })
                    .populate('creator')
                    .populate('userObj')
                    .populate('watchers')
                    .populate('project')
                    .populate('folder')
                    .populate('office')
                    .then(docs => {
                        if(!docs.length) throw new httpError(404);
                        allEntities = allEntities.concat(docs);
                        return resolve(docs);
                    })
            })

        )
    }
    Promise.all(Promises)
        .then( result => {
            res.status(200).send(allEntities)
        })
}
