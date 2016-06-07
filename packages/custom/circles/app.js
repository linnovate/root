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

  return Circles;
});

function registerCircles(circle, circleType, parents, sources) {
  var Circle = require('mongoose').model('Circle');

  var query = {
    name: circle,
    circleType: circleType
  };

  var set = {};
  if (parents) {
    set.$addToSet = {
      circles: {$each: parents}
    };
  }

  if (sources) {
    if (!set.$addToSet) set.$addToSet = {};
    set.$addToSet.sources = {$each: sources};
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
  var GoogleService = require('service-providers')('google');
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
    if(!err && list.groups){
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
}

function getC19n() {
  var nova = [{
    id: '123',
    cl: '0',
    sources: ['a1','a2','a3']
  }, {
    id: '123',
    cl: '1',
    sources: ['b1','b2','b3']
  }, {
    id: '123',
    cl: '2',
    sources: ['c1','c2','c3']
  }, {
    id: '456',
    cl: '0',
    sources: ['d1','d2','d3']
  }, {
    id: '456',
    cl: '1',
    sources: ['e1','e2','e3']
  }, {
    id: '456',
    cl: '2',
    sources: ['f1','f2','f3','f4']
  }, {
    id: '789',
    cl: '0',
    sources: ['g1','g2','g3']
  }];

  for (var i = 0; i < nova.length; i++) {
    var parents;
    if (parseInt(nova[i].cl) > 0) {
      parents = [(parseInt(nova[i].cl) - 1) + nova[i].id];
    } else parents = null;
    registerCircles(nova[i].cl + nova[i].id, 'c19n', parents, nova[i].sources);
  }
}