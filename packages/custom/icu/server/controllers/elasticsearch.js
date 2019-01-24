'use strict';

const mean = require('meanio');
const utils = require('./utils');
const system = require('./system');
const logger = require('../services/logger');

exports.save = function(doc, docType) {
  return new Promise((resolve, reject) => {
    let newDoc = JSON.parse(JSON.stringify(doc));
    let creator =  doc.creator._id || doc.creator;
    delete newDoc._id;

    newDoc.creator = JSON.parse(JSON.stringify(creator));
    mean.elasticsearch.index({
      index: docType,
      type: docType,
      id: doc._id.toString(),
      body: newDoc
    }, function(error, response) {
      if(error) {
        system.sendMessage({service: 'elasticsearch', message: response});
        logger.log('error', 'error saving to elastic', {error: error});
        console.log('elastic.save:', error);
        return reject(error);
      }
      resolve(response);
    });
  });

};

exports.delete = function(doc, docType, next) {
  try {
    mean.elasticsearch.delete({
      index: docType,
      type: docType,
      id: doc._id.toString()
    }, function(error, response) {
      if(error) {
        system.sendMessage({service: 'elasticsearch', message: response});
        logger.log('error', 'error deleting from elastic', {error: error});
        return error;
      }

      return next();
    });
  }
  catch (err) {
    logger.log('error', 'error deleting from elastic', {error: err.message});
  }
};

let buildSearchResponse = exports.buildSearchResponse = function(type, obj, userId) {
  let types = ['task', 'project', 'discussion', 'office', 'folder', 'officedocument', 'attachment', 'update'];
  let groups = {};
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

  // Go through all types.
  for(let j = 0; j < types.length; j++) {

    // If the type exists in the groups array.
    if(groups[types[j]]) {
      let res = [];

      // go through all objects of this type.
      for(let i = 0; i < groups[types[j]].length; i++) {
        // Current object.
        let obj = groups[types[j]][i];

        // If the user has permission for the obj insert it to results.
        if(obj.creator == userId || obj.assign == userId || obj.watchers.includes(userId))
          res.push(obj);
      }
      groups[types[j]] = res;
    }
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
          fields: ['title^3', 'color', 'name', 'tags', 'description', 'file.filename', 'serial', 'folderIndex'],
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
