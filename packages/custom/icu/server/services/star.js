'use strict';

var _ = require('lodash');

var UserModel = require('../models/user.js');
var TaskModel = require('../models/task.js');
var ProjectModel = require('../models/project.js');
var DiscussionModel = require('../models/discussion.js');
var UpdateModel = require('../models/update.js');

var taskOptions = require('../controllers/task.js').defaultOptions;
var discussionOptions = require('../controllers/discussion.js').defaultOptions;
var projectOptions = require('../controllers/project.js').defaultOptions;

var entityNameMap = {
  'tasks': {
    model: TaskModel,
    options: taskOptions
  },
  'projects': {
    model: ProjectModel,
    options: projectOptions
  },
  'discussions': {
    model: DiscussionModel,
    options: discussionOptions
  },
  'updates': {
    model: UpdateModel,
    options: {
      includes: []
    }
  }
};

module.exports = function(entityName, options) {
  function starEntity(id, value) {
    var starredEntities = 'starred' + _.capitalize(entityName);

    var starred = false;
    return UserModel.findById(options.user._id).then(function(user) {
      var query;

      var profileProperty = 'profile.' + starredEntities;
      var hasNoProfile = !user.profile || !user.profile[starredEntities];

      if (hasNoProfile && (value === 'toggle' || value === 'star')) {
        query = {};
        query[profileProperty] = [id];
      } else if (!hasNoProfile) {
        var starFound = user.profile[starredEntities].indexOf(id) > -1;
        if (starFound && (value === 'toggle' || value === 'unstar')) {
          query = { $pull: {} };
          query.$pull[profileProperty] = id;
        } else if (!starFound && (value === 'toggle' || value === 'star')) {
          query = { $push: {} };
          query.$push[profileProperty] = id;

          starred = true;
        }
      }

      if (!query) {
        return starred;
      } else {
        return user.update(query).then(function() {
          return starred;
        });
      }
    });
  }

  function getStarredIds() {
    var query = UserModel.findOne({
      _id: options.user._id
    });
    return query.then(function(user) {
      var starredEntities = 'starred' + _.capitalize(entityName);
      if (!user.profile || !user.profile[starredEntities] || user.profile[starredEntities].length === 0) {
        return [];
      } else {
        return user.profile[starredEntities];
      }
    });
  }


  function getStarred() {
    if(entityName.assing){
      var assign = entityName.assing;
      entityName = entityName.name;
    }
    var Model = entityNameMap[entityName].model;
    var modelOptions = entityNameMap[entityName].options;

    var query = UserModel.findOne({
      _id: options.user._id
    });
    return query.then(function(user) {
      if (!user) return [];

      var starredEntities = 'starred' + _.capitalize(entityName);

      if (!user.profile || !user.profile[starredEntities] || user.profile[starredEntities].length === 0) {
        return [];
      } else {
	      var tmp = {
	        '_id': {
	          $in: user.profile[starredEntities]
	        },
	      }

	      if (assign) {
	        tmp['assign'] = user._id
	        tmp['status'] = {$nin: ['rejected', 'done']}
	      }
        return Model.find(
          tmp
        // {
        //   '_id': {
        //     $in: user.profile[starredEntities]
        //   },
        //   'assign':user._id
        // }
        ).populate(modelOptions.includes);
      }
    });
  }

  function isStarred(data) {
    return getStarred().then(function(starred) {
      if (!_.isArray(data)) {
        data = [data];
      }

      var ids = _(data).reduce(function(memo, item) {
        var id = item._id.toString();
        memo.push(id);

        return memo;
      }, []);

      starred = _(starred).reduce(function(memo, item) {
        var id = item._id.toString();
        memo.push(id);

        return memo;
      }, []);

      var matches = _.intersection(starred, ids);


      data.forEach(function(d) {
        d.star = _(matches).any(function(m) {
          return d._id.toString() === m;
        });
      });
    });
  }

  return {
    starEntity: starEntity,
    getStarred: getStarred,
    getStarredIds: getStarredIds,
    isStarred: isStarred
  };
};
