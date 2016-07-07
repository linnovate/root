'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var mongoose = require('mongoose');

var Circles = new Module('circles');

var config = require('meanio').loadConfig();

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */

Circles.register(function(app, auth, database) {

  Circles.routes(app, auth, database);

  Circles.aggregateAsset('css', 'circles.css');

  Circles.menus.add({
    title: 'Circles',
    link: 'manage circles',
    roles: ['authenticated', 'admin'],
    menu: 'main'
  });

  Circles.models = {};

  // ensureCirclesExist();

  getGoogleGroups();

  getC19n();

  getC19nGroups();

  return Circles;
});

function registerCircles(circle, circleType, parents, isActive) {
  var Circle = require('mongoose').model('Circle');

  if (typeof(isActive) !== 'boolean') isActive = true;
  var query = {
    name: circle,
    circleType: circleType,
    isActive: isActive
  };

  var set = {};
  if (parents) {
    set.$addToSet = {
      circles: {
        $each: parents
      }
    };
  }

  Circle.findOneAndUpdate(query, set, {
    upsert: true
  }, function(err) {
    if (err) console.log(err);
  });

}

/*
Y Override queries to check user permisisons
Y Add middleware for checking for specific circles by name
O Page to create and manage circles + sow circles heirarchy
*/

function getGoogleGroups() {
  var GoogleService = require('serviceproviders')('google');
  var service = new GoogleService(config.google.clientSecret, config.google.clientID, config.google.callbackURL);

  var getMembers = function(group, rv, cb) {
    service.sdkManager('members', 'list', {
      groupKey: group.email
    }, function(err, list) {
      if (!list || !list.members) {
        return (cb());

      }
      var filter = list.members.filter(function(member) {
        return member.type === 'GROUP'
      });
      for (var i = 0; i < filter.length; i++) {
        registerCircles(group.name, 'groups', [rv[filter[i].id].name]);
      }
      cb();
    })
  };

  service.sdkManager('groups', 'list', {
    domain: 'linnovate.net',
  }, function(err, list) {
    console.log(err)
    if (!err && list.groups) {
      var obj = list.groups.reduce(function(o, v) {
        o[v.id] = v;
        return o;
      }, {});
      var counter = list.groups.length;
      for (var i = 0; i < list.groups.length; i++) {
        getMembers(list.groups[i], obj, function() {
          counter--;
          if (counter === 0) {
            for (var i = 0; i < list.groups.length; i++) {
              registerCircles(list.groups[i].name, 'groups');
            }
          }
        })

      }
    }
  })
};

function getC19nGroups() {
  var groups = [{
    id: '91234',
    name: 'g1',
    type: 'c19nGroups1',
    isActive: true
  }, {
    id: '91244',
    name: 'g2',
    type: 'c19nGroups1',
    isActive: true
  }, {
    id: '91254',
    name: 'g3',
    type: 'c19nGroups1',
    isActive: false
  }, {
    id: '91264',
    name: 'g4',
    type: 'c19nGroups1',
    isActive: true
  }, {
    id: '91274',
    name: 'g5',
    type: 'c19nGroups2',
    isActive: true
  }, {
    id: '91284',
    name: 'g6',
    type: 'c19nGroups2',
    isActive: false
  }, {
    id: '91294',
    name: 'g7',
    type: 'c19nGroups2',
    isActive: true
  }];

  for (var i = 0; i < groups.length; i++) {
    registerCircles(groups[i].name, groups[i].type, null, groups[i].isActive);
  }
};

function getC19n() {
  var sources = [{
    id: '9123',
    name: 'a1',
    linkedTriangleId: '123',
    clearance: '0'
  }, {
    id: '9124',
    name: 'a2',
    linkedTriangleId: '123',
    clearance: '0'
  }, {
    id: '9125',
    name: 'a3',
    linkedTriangleId: '123',
    clearance: '0'
  }, {
    id: '9126',
    name: 'b1',
    linkedTriangleId: '123',
    clearance: '1'
  }, {
    id: '9127',
    name: 'b2',
    linkedTriangleId: '123',
    clearance: '1'
  }, {
    id: '9128',
    name: 'b3',
    linkedTriangleId: '123',
    clearance: '1'
  }, {
    id: '9129',
    name: 'c1',
    linkedTriangleId: '123',
    clearance: '2'
  }, {
    id: '9130',
    name: 'c2',
    linkedTriangleId: '123',
    clearance: '2'
  }, {
    id: '9131',
    name: 'c3',
    linkedTriangleId: '123',
    clearance: '2'
  }, {
    id: '8123',
    name: 'd1',
    linkedTriangleId: '456',
    clearance: '0'
  }, {
    id: '8124',
    name: 'd2',
    linkedTriangleId: '456',
    clearance: '0'
  }, {
    id: '8125',
    name: 'd3',
    linkedTriangleId: '456',
    clearance: '0'
  }, {
    id: '8126',
    name: 'e1',
    linkedTriangleId: '456',
    clearance: '1'
  }, {
    id: '8127',
    name: 'e2',
    linkedTriangleId: '456',
    clearance: '1'
  }, {
    id: '8128',
    name: 'e3',
    linkedTriangleId: '456',
    clearance: '1'
  }, {
    id: '8129',
    name: 'f1',
    linkedTriangleId: '456',
    clearance: '2'
  }, {
    id: '8130',
    name: 'f2',
    linkedTriangleId: '456',
    clearance: '2'
  }, {
    id: '8131',
    name: 'f3',
    linkedTriangleId: '456',
    clearance: '2'
  }, {
    id: '8132',
    name: 'f4',
    linkedTriangleId: '456',
    clearance: '2'
  }];

  var Source = require('mongoose').model('Source');

  var circles = {};

  for (var i = 0; i < sources.length; i++) {
    Source.findOneAndUpdate({
      sourceId: sources[i].id
    }, {
      sourceId: sources[i].id,
      name: sources[i].name,
      circleName: sources[i].clearance + sources[i].linkedTriangleId,
      circleType: 'c19n'
    }, {
      upsert: true
    }).exec(function(err, source) {

    });

    if (!circles[sources[i].linkedTriangleId]) circles[sources[i].linkedTriangleId] = [];
    if (circles[sources[i].linkedTriangleId].indexOf(sources[i].clearance) < 0)
      circles[sources[i].linkedTriangleId].push(sources[i].clearance)
  }
  for (var triangleId in circles) {
    var clearances = circles[triangleId].sort();
    for (var i = 0; i < clearances.length; i++) {
      var parents;
      if (clearances[i + 1]) {
        parents = [clearances[i + 1] + triangleId];
      } else parents = null;
      registerCircles(clearances[i] + triangleId, 'c19n', parents);
    }
  }
}