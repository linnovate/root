"use strict";

var querystring = require("querystring");
var _ = require("lodash");

function parseParams(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  //Lack of if-else optimisation is
  //indetended to ensure undefined as
  //value of type, if there is no needed
  //query params
  var type;
  if (req.query.id && req.query.limit) {
    type = "id";
  } else if (req.query.start && req.query.limit) {
    type = "page";
  }

  req.locals.data.pagination = {
    type: type,
    sort: req.query.sort || "created",
    start: req.query.start ? Number(req.query.start) : undefined
  };
  if (req.query.status) {
    req.locals.data.pagination.status = req.query.status;
  }

  if (req.query.limit && isNaN(Number(req.query.limit))) {
    let { entityName } = req.locals.data;
    let extra = 25;
    entityName = entityName[0].toUpperCase() + entityName.slice(1, -1);
    require("mongoose")
      .model(entityName)
      .find({})
      .sort(req.query.sort || "created")
      .then(docs => {
        let count = docs.findIndex(
          doc => doc._id.toString() === req.query.limit
        );
        if (req.query.start < count) {
          count -= req.query.start;
          count += extra;
        }
        req.locals.data.pagination.limit = count;
        next();
      });
  } else {
    req.locals.data.pagination.limit = Number(req.query.limit);
    next();
  }
}

function formResponse(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  let defaultLimit = 25;

  var pagination = req.locals.data.pagination;
  if (pagination && pagination.type) {
    var page = {
      count: pagination.count,
      content: req.locals.result
    };

    var baseUrl = req.originalUrl.split("?")[0];

    if (pagination.type === "page") {
      // Compute prev URL
      if (pagination.start > 0) {
        let prevLimit;
        if (pagination.start < defaultLimit) {
          prevLimit = pagination.start;
        } else {
          prevLimit = defaultLimit;
        }

        page.prev =
          baseUrl +
          "?" +
          querystring.stringify({
            sort: pagination.sort,
            start: pagination.start - prevLimit,
            limit: prevLimit
          });
      }

      // Compute next URL
      if (pagination.start + page.content.length < pagination.count) {
        page.next =
          baseUrl +
          "?" +
          querystring.stringify({
            sort: pagination.sort,
            limit: defaultLimit,
            start: pagination.start + page.content.length
          });
      }
    }

    page.sort =
      baseUrl +
      "?" +
      querystring.stringify({
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
