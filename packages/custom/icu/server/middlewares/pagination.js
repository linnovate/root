'use strict';

var querystring = require('querystring');
var _ = require('lodash');

function parseParams(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  //Lack of if-else optimisation is
  //indetended to ensure undefined as
  //value of type, if there is no needed
  //query params
  var type;
  if(req.query.id && req.query.limit) {
    type = 'id';
  }
  else if(req.query.start && req.query.limit) {
    type = 'page';
  }

  req.locals.data.pagination = {
    type: type,
    sort: req.query.sort ? req.query.sort : 'created',
    start: req.query.start ? +req.query.start : undefined,
    limit: req.query.limit ? +req.query.limit : undefined
  };

  next();
}

function formResponse(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  var pagination = req.locals.data.pagination;
  if(pagination && pagination.type) {
    var page = {
      count: pagination.count,
      content: req.locals.result
    };

    var baseUrl = req.originalUrl.split('?')[0];

    var prevParams, nextParams;
    var prevUrl, nextUrl;

    if(pagination.type === 'page') {
      var hasPrev = pagination.start - pagination.limit > -pagination.count;
      var prevLimit = 0;

      if(hasPrev) {
        var prevStart = pagination.start - pagination.limit;
        if(prevStart < 0) {
          prevLimit = prevStart;
          prevStart = 0;
        }

        prevParams = _(pagination).omit('type', 'count').value();
        prevParams.start = prevStart;
        prevParams.limit = pagination.limit + prevLimit;
        prevUrl = baseUrl + '?' + querystring.stringify(prevParams);

        page.prev = prevUrl;
      }

      var hasNext = pagination.start + pagination.limit < pagination.count;
      if(hasNext) {
        var nextStart = pagination.start + pagination.limit;

        nextParams = _(pagination).omit('type', 'count').value();
        nextParams.start = nextStart;
        nextUrl = baseUrl + '?' + querystring.stringify(nextParams);

        page.next = nextUrl;
      }
    }

    page.sort = baseUrl + '?' + querystring.stringify({
      start: 0,
      limit: pagination.limit
    });

    req.locals.result = page;
  }

  next();
}

module.exports = {
  parseParams: parseParams,
  formResponse: formResponse
};
