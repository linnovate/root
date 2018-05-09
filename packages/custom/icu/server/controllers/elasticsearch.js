'use strict';

var mean = require('meanio'),
  utils = require('./utils'),
  system = require('./system');

exports.save = function(doc, docType, room, title) {
  // console.log("exports.save") ;
  var newDoc = JSON.parse(JSON.stringify(doc));
  delete newDoc._id;
  // console.log("JSON.stringify(doc)") ;
  // console.log(JSON.stringify(doc)) ;
  let creator =  doc.creator._id || doc.creator; // comes both ways
  newDoc.creator =  JSON.parse(JSON.stringify(creator));
  // console.log("JSON.stringify(newdoc)");
  // console.log(JSON.stringify(newDoc)) ;
  // delete newDoc.watchers ; // the mapping of watchers is irrelevant - and needs to be recreated/refactored as a list of uids.
  mean.elasticsearch.index({
    index: docType,
    type: docType,
    id: doc._id.toString(),
    body: newDoc
  }, function(error, response) {
    // utils.checkAndHandleError(error, res);
    if(error)
      system.sendMessage({service: 'elasticsearch', message: response});
    return error;
    //if (room)
    //    if (docType === 'attachment')
    //        notifications.sendFile({entityType: docType, title: title, room:room, method: 'uploaded', path: doc.path, issue:doc.issue});
    //    else
    //notifications.sendFromApi({entityType: docType, title: doc.title, room:room, method: (response.created ? 'created' : 'updated')});
    return doc;
  });
};

exports.delete = function(doc, docType, room, next) {
  mean.elasticsearch.delete({
    index: docType,
    type: docType,
    id: doc._id.toString()
  }, function(error, response) {
    if(error)
      system.sendMessage({service: 'elasticsearch', message: response});
    return error;

    // utils.checkAndHandleError(error, res);
    //if (room)
    //  notifications.sendFromApi({entityType: docType, title: doc.title, room: room, method: 'deleted'});
    return next();
  });
};

function inArray(elm, array) {
  for(var i = 0; i < array.length; i++) {
    if(array[i] == elm) {
      return i;
    }
  }
  return -1;
}

var buildSearchResponse = exports.buildSearchResponse = function(type, obj, userId) {

  console.yon('inbuild response');
  console.log(type);
  var groups = {};
  if(type === 'aggs') {
    obj.forEach(function(i) {
      if(i.key != 'update')
        groups[i.key] =
          i.top.hits.hits.map(function(j) {
            return Object.assign(j._source, j.highlight);
          });
    });
  }
  else {
    obj.map(function(i) {
      if(!groups.hasOwnProperty(i._index))
        groups[i._index] = [];
      groups[i._index].push(i._source);
    });
  }

  if(groups.task != undefined && groups.task != null) {
    var finalResults1 = [];
    for(var i = 0; i < groups.task.length; i++) {
      var task = groups.task[i];
      if(task.creator == userId || task.assign == userId || inArray(userId, task.watchers) != -1) {
        finalResults1.push(task);
      }
    }
    groups['task'] = finalResults1;
  }
  if(groups.task != undefined && groups.task != null) {
    var finalResults1 = [];
    for(var i = 0; i < groups.task.length; i++) {
      var task = groups.task[i];
      if(task.creator == userId || task.assign == userId || inArray(userId, task.watchers) != -1) {
        finalResults1.push(task);
      }
    }
    groups['task'] = finalResults1;
  }

  if(groups.project != undefined && groups.project != null) {
    var finalResults2 = [];
    for(var i = 0; i < groups.project.length; i++) {
      var project = groups.project[i];
      if(project.creator == userId || inArray(userId, project.watchers) != -1) {
        finalResults2.push(project);
      }
    }
    groups['project'] = finalResults2;
  }

  if(groups.discussion != undefined && groups.discussion != null) {
    var finalResults3 = [];
    for(var i = 0; i < groups.discussion.length; i++) {
      var discussion = groups.discussion[i];
      if(discussion.creator == userId || inArray(userId, discussion.watchers) != -1) {
        finalResults3.push(discussion);
      }
    }
    groups['discussion'] = finalResults3;
  }

  if(groups.office != undefined && groups.office != null) {
    var finalResults2 = [];
    for(var i = 0; i < groups.office.length; i++) {
      var office = groups.office[i];
      if(office.creator == userId || inArray(userId, office.watchers) != -1) {
        finalResults2.push(office);
      }
    }
    groups['office'] = finalResults2;
  }

  if(groups.folder != undefined && groups.folder != null) {
    var finalResults2 = [];
    for(var i = 0; i < groups.folder.length; i++) {
      var folder = groups.folder[i];
      if(folder.creator == userId || inArray(userId, folder.watchers) != -1) {
        finalResults2.push(folder);
      }
    }
    groups['folder'] = finalResults2;
  }

  if(groups.officedocument != undefined && groups.officedocument != null) {
    var finalResults2 = [];
    for(var i = 0; i < groups.officedocument.length; i++) {
      var officedocument = groups.officedocument[i];
      if(officedocument.creator == userId || inArray(userId, officedocument.watchers) != -1) {
        finalResults2.push(officedocument);
      }
    }
    groups['officedocument'] = finalResults2;
  }

  if(groups.attachment != undefined && groups.attachment != null) {
    var finalResults2 = [];
    for(var i = 0; i < groups.attachment.length; i++) {
      var attachment = groups.attachment[i];
      if(attachment.creator == userId || inArray(userId, attachment.watchers) != -1) {
        finalResults2.push(attachment);
      }
    }
    groups['attachment'] = finalResults2;
  }

  if(groups.update != undefined && groups.update != null) {
    var finalResults2 = [];
    for(var i = 0; i < groups.update.length; i++) {
      var update = groups.update[i];
      if(update.creator == userId) {
        finalResults2.push(update);
      }
    }
    groups['update'] = finalResults2;
  }


  return groups;
};

exports.search = function(req, res, next) {
  var userId = req.user._id;
  if(!req.query.term) {
    return;
  }
  var query;
  if(req.query.term === '___') {
    var queryInQuery = {
      query: {
        match_all: {}
      }
    };
    var query = {
      highlight: {
        pre_tags: ['<bold>'],
        post_tags: ['</bold>'],
        fields: {
          title: {},
          color: {},
          name: {},
          tags: {},
          description: {},
          'file.filename': {},
          serial: {}
        }
      },

      aggs: {
        group_by_index: {
          terms: {
            field: '_index'
          },
          aggs: {
            top: {
              top_hits: {
                highlight: {
                  fields: {
                    title: {}
                  }
                },
                size: 100,
              }
            }
          }
        }
      }
    };
  }
  else {
    var query = {
      highlight: {
        pre_tags: ['<bold>'],
        post_tags: ['</bold>'],
        fields: {
          title: {},
          color: {},
          name: {},
          tags: {},
          description: {},
          'file.filename': {},
          serial: {}
        }
      },
      query: {
        multi_match: {
          query: req.query.term.replace(',', '* '),
          type: 'cross_fields',
          fields: ['title^3', 'color', 'name', 'tags', 'description', 'file.filename', 'serial'],
          operator: 'or'
        }
      },
      aggs: {
        group_by_index: {
          terms: {
            field: '_index'
          },
          aggs: {
            top: {
              top_hits: {
                highlight: {
                  fields: {
                    title: {}
                  }
                },
                size: 100,
              }
            }
          }
        }
      }
    };
  }



  var options = {
    //index: req.query.index ? req.query.index.split(',') : ['project', 'task', 'discussion', 'user', 'attachment'],
    ignore_unavailable: true,
    from: 0,
    size: 3000,
    body: query
  };

  mean.elasticsearch.search(options, function(err, result) {
    console.log('****************************************************result');
    if(result && result.hits) console.dir(result.hits.hits);
    console.log('****************************************************');
    if(err) {
      system.sendMessage({service: 'elasticsearch', message: result});
    }
    utils.checkAndHandleError(err, 'Failed to find entities', next);

    if(req.query.term) {
      if(!result.aggregations) {
        console.log('result.aggregations=' + result.aggregations);
        return next(new Error('Can\'t find ' + req.query.term));
      }
      res.send(buildSearchResponse('aggs', result.aggregations.group_by_index.buckets, userId));
    }
    else {
      res.send(buildSearchResponse('simple', result.hits.hits, userId));
    }
  });
};

exports.advancedSearch = function(query) {
  var queries = [],
    jsonQuery;
  for(var i in query) {
    var isArray = query[i].indexOf(',') > -1;
    if(isArray) {
      var terms = query[i].split(',');
      jsonQuery = {
        terms: {
          minimum_should_match: terms.length
        }
      };
      jsonQuery.terms[i] = terms;
      queries.push(jsonQuery);
    }
    else {
      jsonQuery = {
        term: {}
      };
      jsonQuery.term[i] = query[i];
      queries.push(jsonQuery);
    }
  }
  return {
    query: {
      filtered: {
        query: {
          bool: {
            must: queries
          }
        }
      }
    }
  };
};
