"use strict";

let _ = require("lodash"),
  async = require("async"),
  config = require("meanio").loadConfig(),
  ObjectId = require("mongoose").Types.ObjectId,
  Document = require("../models/document");

const taskStatusMapper = {
  new: "חדש",
  assigned: "נבחר אחראי",
  "in-progress": "בתהליך",
  review: "בבדיקה",
  rejected: "נדחה",
  done: "בוצע"
};
/**
 * includes = space seperated entities to populate in middleware .all
 *
 */
var options = {
  includes: "assign watchers project discussion subTasks discussions creator",
  defaults: {
    project: undefined,
    assign: undefined,
    discussions: [],
    watchers: [],
    circles: {}
  },
  conditions: {
    tType: {
      $ne: "template"
    },
    $or: [
      {
        parent: null
      },
      {
        parent: {
          $exists: false
        }
      }
    ]
  }
};

exports.defaultOptions = options;

let crud = require("../controllers/crud.js");
let task = crud("tasks", options);
let Project = require("../controllers/project");
let mailService = require("../services/mail");
let excelService = require("../services/excel");

var Task = require("../models/task"),
  Discussion = require("../models/discussion"),
  mean = require("meanio");

var Order = require("../models/order");

Object.keys(task).forEach(function(methodName) {
  if (methodName !== "create" && methodName !== "update") {
    exports[methodName] = task[methodName];
  }
});

Date.prototype.getThisDay = function() {
  var date = new Date();
  // return [date.setHours(0,0,0,0), date.setHours(23,59,59,999)];
  return [
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    )
  ];
};

Date.prototype.getWeek = function() {
  var today = new Date(this.setHours(0, 0, 0, 0));
  var date = today.getDate() - today.getDay();

  var StartDate = new Date(today.setDate(date));
  var EndDate = new Date(today.setDate(StartDate.getDate() + 6));
  // EndDate.setHours(23,59,59,999);
  // return [StartDate, EndDate];
  return [
    Date.UTC(
      StartDate.getFullYear(),
      StartDate.getMonth(),
      StartDate.getDate(),
      0,
      0,
      0,
      0
    ),
    Date.UTC(
      EndDate.getFullYear(),
      EndDate.getMonth(),
      EndDate.getDate(),
      23,
      59,
      59,
      999
    )
  ];
};

exports.relateEntity = function(req, res, next) {
  let { taskId, entityType, entityId } = req.body;

  Task.findOne({ _id: taskId })
    .populate("watchers")
    .then(doc => {
      if (!doc[entityType]) doc[entityType] = [];
      doc[entityType].push(new ObjectId(entityId));
      return doc;
    })
    .then(doc => {
      res.json(doc);
    })
    .catch(function(err) {
      next(err);
    });
};

exports.create = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  req.body.discussions = [];
  if (req.body.discussion) {
    req.body.discussions = [req.body.discussion];
    req.body.tags = [];
    Discussion.findById(req.body.discussion, function(err, discussion) {
      if (discussion && discussion.project) {
        req.body.project = discussion.project;
      }
      task.create(req, res, next);
    });
  } else task.create(req, res, next);
};

exports.update = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  req.locals.action = "update";
  if (req.body.discussion) {
    var alreadyAdded = _(req.locals.result.discussions).any(function(d) {
      return d.toString() === req.body.discussion;
    });

    if (!alreadyAdded) {
      req.body.discussions = req.locals.result.discussions;
      req.body.discussions.push(req.body.discussion);
    }
  }

  if (
    req.body.subTasks &&
    req.body.subTasks.length &&
    !req.body.subTasks[req.body.subTasks.length - 1]._id
  ) {
    req.body.subTasks.pop();
  }

  task.update(req, res, next);
};

exports.tagsList = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery("Task");
  query.distinct("tags", function(error, tags) {
    if (error) {
      req.locals.error = {
        message: "Can't get tags"
      };
    } else {
      req.locals.result = tags || [];
    }

    next();
  });
};

exports.getByEntity = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var entities = {
      tasks: "task",
      projects: "project",
      users: "assign",
      discussions: "discussions",
      officeDocuments: "officeDocument",
      tags: "tags"
    },
    entityQuery = {
      tType: {
        $ne: "template"
      },
      $or: [
        {
          parent: null
        },
        {
          parent: {
            $exists: false
          }
        }
      ]
    };
  entityQuery[entities[req.params.entity]] =
    req.params.id instanceof Array
      ? {
          $in: req.params.id
        }
      : req.params.id;

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if (ids && ids.length) {
    entityQuery._id = {
      $in: ids
    };
    starredOnly = true;
  }
  var query = req.acl.mongoQuery("Task");

  query.find(entityQuery);
  query.populate(options.includes);

  Task.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;

    var pagination = req.locals.data.pagination;
    if (pagination && pagination.type && pagination.type === "page") {
      query
        .sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }
    //if(pagination.sort == "custom"){
    // Task.aggregate([
    //   {$unwind: '$ref'},
    //    {
    //      $lookup:{
    //              from: 'Ordertasks',
    //              localField: '_id',
    //              foreignField: 'ref',
    //              as: 'tasks'}
    //      },
    //       {$sort: {'tasks.order':1 }}
    //  ]).exec(function(err, tasks) {
    //    console.log(tasks);
    //  });
    // query.exec(function(err, tasks) {
    //       tasks.forEach(function(element){
    //           Order.find({ref:element._id},function(doc){

    //           })
    //       })
    //     })
    //}
    query.exec(function(err, tasks) {
      if (err) {
        req.locals.error = {
          message: "Can't get tags"
        };
      } else if (starredOnly) {
        tasks.forEach(function(task) {
          task.star = true;
        });
      }
      if (pagination.sort == "custom") {
        var temp = new Array(tasks.length);
        var tasksTemp = tasks;
        Order.find({ name: "Task", project: tasks[0].project }, function(
          err,
          data
        ) {
          data.forEach(function(element) {
            for (var index = 0; index < tasksTemp.length; index++) {
              if (
                JSON.stringify(tasksTemp[index]._id) ===
                JSON.stringify(element.ref)
              ) {
                temp[element.order - 1] = tasks[index];
              }
            }
          });
          tasks = temp;
          req.locals.result = tasks;
          next();
        });
      } else {
        req.locals.result = tasks;

        next();
      }
    });
  });
};

exports.getByOfficeDocumentId = function(req, res, next) {
  let taskId = req.params.id;

  Task.findOne({ _id: taskId })
    .populate("officeDocuments")
    .then(doc => {
      req.locals.data.pagination.count = doc.officeDocuments.length || 0;
      req.locals.result = doc.officeDocuments || [];
      next();
    });
};

exports.getZombieTasks = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var Query = Task.find({
    project: {
      $eq: null
    },
    discussions: {
      $size: 0
    },
    currentUser: req.user,
    tType: { $ne: "template" }
  });
  Query.populate(options.includes);

  Query.exec(function(err, tasks) {
    if (err) {
      req.locals.error = {
        message: "Can't get zombie tasks"
      };
    } else {
      req.locals.result = tasks;
    }

    next();
  });
};

var byAssign = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var query = req.acl.mongoQuery("Task");
  query
    .find({
      assign: req.user._id,
      status: { $nin: ["rejected", "done"] },
      tType: { $ne: "template" }
    })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if (err) {
        req.locals.error = {
          message: "Can't get my tasks"
        };
      } else {
        req.locals.result = tasks;
      }

      next();
    });
};

function getTasksDueTodayQuery(req, callback) {
  var dates = new Date().getThisDay();
  var query = {
    query: {
      bool: {
        must: [
          {
            range: {
              due: {
                gte: dates[0], //Date.parse(start),
                lte: dates[1] //Date.parse(end)
              }
            }
          },
          {
            term: {
              assign: req.user._id
            }
          }
        ],
        must_not: [
          {
            terms: {
              status: ["rejected", "done"]
              //"execution" : "and"
            }
          },
          {
            term: { tType: "template" }
          }
        ]
      }
    }
  };
  tasksFromElastic(query, "TasksDueToday", callback);
}

function getTasksDueWeekQuery(req, callback) {
  var dates = new Date().getWeek();
  var query = {
    query: {
      bool: {
        must: [
          {
            range: {
              due: {
                gte: dates[0],
                lte: dates[1]
              }
            }
          },
          {
            term: {
              assign: req.user._id
            }
          }
        ],
        must_not: [
          {
            terms: {
              status: ["rejected", "done"] //,
              // "execution" : "and"
            }
          },
          {
            term: { tType: "template" }
          }
        ]
      }
    }
  };
  tasksFromElastic(query, "TasksDueWeek", callback);
}

function getOverDueTasksQuery(req, callback) {
  var dates = new Date().getThisDay();
  var query = {
    query: {
      bool: {
        must: [
          {
            range: {
              due: {
                lt: dates[0]
              }
            }
          },
          {
            term: {
              assign: req.user._id
            }
          }
        ],
        must_not: [
          {
            terms: {
              status: ["rejected", "done"] //,
              //"execution" : "and"
            }
          },
          {
            term: { tType: "template" }
          }
        ]
      }
    }
  };
  tasksFromElastic(query, "OverDueTasks", callback);
}

function getWatchedTasksQuery(req, callback) {
  var query = {
    query: {
      bool: {
        must: {
          term: {
            watchers: req.user._id
          }
        },
        must_not: [
          {
            term: {
              assign: req.user._id
            }
          },
          {
            terms: {
              status: ["rejected", "done"] //,
              //"execution" : "and"
            }
          },
          {
            term: { tType: "template" }
          }
        ]
      }
    }
  };
  tasksFromElastic(query, "WatchedTasks", callback);
}

function tasksFromElastic(query, name, callback) {
  mean.elasticsearch.search(
    {
      index: "task",
      body: query
    },
    function(err, response) {
      if (err) {
        callback(err);
      } else {
        //   req.locals.result = response.hits.hits.map(function (item) {
        //     return item._source;
        // })
        callback(null, {
          key: name,
          value: response.hits.total
        });
      }
    }
  );
}

function myTasksStatistics(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  async.parallel(
    [
      function(callback) {
        getTasksDueTodayQuery(req, callback);
      },
      function(callback) {
        getTasksDueWeekQuery(req, callback);
      },
      function(callback) {
        getOverDueTasksQuery(req, callback);
      },
      function(callback) {
        getWatchedTasksQuery(req, callback);
      }
    ],
    function(err, result) {
      req.locals.result = result;
      req.locals.error = err;
      next();
    }
  );
}

exports.getWatchedTasks = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  Task.find(
    {
      watchers: req.user._id,
      assign: {
        $ne: req.user._id
      },
      status: {
        $nin: ["rejected", "done"]
      },
      tType: { $ne: "template" }
    },
    function(err, response) {
      var length = Object.keys(response).length;
      if (err) {
        req.locals.error = err;
      } else {
        res.send(length.toString());
        req.locals.result = response;
      }
      next();
    }
  );
};

exports.getWatchedTasksList = function(req, res, next) {
  //if (req.locals.error) {
  //  return next();
  //}
  Task.find(
    {
      watchers: req.user._id,
      assign: {
        $ne: req.user._id
      },
      status: {
        $nin: ["rejected", "done"]
      },
      tType: { $ne: "template" }
    },
    function(err, response) {
      if (err) {
        req.locals.error = err;
      } else {
        res.send(response);
        req.locals.result = response;
      }
      //next();
    }
  );
};

exports.getOverdueWatchedTasks = function(req, res, next) {
  // if (req.locals.error) {
  //   return next();
  // }

  var dates = new Date().getThisDay();
  Task.find(
    {
      watchers: req.user._id,
      assign: {
        $ne: req.user._id
      },
      status: {
        $nin: ["rejected", "done"]
      },
      due: {
        $lt: dates[0]
      },
      tType: { $ne: "template" }
    },
    function(err, response) {
      if (err) {
        req.locals.error = err;
      } else {
        req.locals.result = response;
        res.send(response);
      }
      //  next();
    }
  );
};

exports.getSubTasks = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var query = req.acl.mongoQuery("Task");
  query
    .findOne(
      {
        _id: req.params.id,
        tType: { $ne: "template" }
      },
      {
        subTasks: 1
      }
    )
    .populate("subTasks")
    .deepPopulate("subTasks.subTasks subTasks.watchers")
    .exec(function(err, task) {
      if (err) {
        req.locals.error = err;
      } else if (task) {
        req.locals.result = task.subTasks;
      }
      next();
    });
};

exports.updateParent = function(req, res, next) {
  if (req.locals.error || !req.body.parent) {
    return next();
  }
  var data = {
    $push: {
      subTasks: req.locals.result._id
    }
  };
  Task.findOneAndUpdate(
    {
      _id: req.body.parent,
      tType: { $ne: "template" }
    },
    data,
    function(err, task) {
      if (err) {
        req.locals.error = err;
      }
      next();
    }
  );
};

exports.takeParentWatchers = function(req, res, next) {
  let parentId = req.body.officeDocument;
  if (req.locals.error || !parentId) {
    return next();
  }

  if (parentId) {
    Document.findOne({ id: parentId }).exec((err, doc) => {
      if (err) {
        req.locals.error = err;
        next();
      } else if (doc) {
        req.locals.result.watchers = doc.watchers;
        req.locals.result.permissions = doc.permissions;
        Task.findOneAndUpdate(
          { _id: req.locals.result._id },
          {
            $set: {
              watchers: doc.watchers,
              permissions: doc.permissions
            }
          },
          (err, success) => {
            if (err) {
              req.locals.error = err;
              next();
            }
            next();
          }
        );
      } else {
        next();
      }
    });
  }
};

exports.removeSubTask = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  Task.findOne(
    {
      _id: req.params.id,
      tType: { $ne: "template" }
    },
    function(err, subTask) {
      if (err) {
        req.locals.error = err;
      } else {
        Task.update(
          {
            _id: subTask.parent,
            tType: { $ne: "template" }
          },
          {
            $pull: {
              subTasks: subTask._id
            }
          },
          function(err, task) {
            if (err) {
              req.locals.error = err;
            }
            next();
          }
        );
      }
    }
  );
};

exports.populateSubTasks = function(req, res, next) {
  Task.populate(
    req.locals.result,
    {
      path: "subTasks.watchers",
      model: "User"
    },
    function(err, tasks) {
      if (err) {
        req.locals.error = err;
      } else req.locals.result = tasks;
      next();
    }
  );
};

// Function to Separate Array With Timeout
// Gets array of users & name of function to pass the separate users
// It's with the Timeout because the mail server has limit per minute for SMTP mails by client
async function SeparateArrayWithTimeout(users, functionName){
  
  if(users.length != 0)
  {
    setTimeout(function(){
      functionName(users.pop()._doc);
      
      // Lop until the array is empty
      if(users.length != 0)
      {
        SeparateArrayWithTimeout(users, functionName);
      }
    }, 20000);
  }
};


exports.GetUsersWantGetMyTodayTasksMail = async function() {
  var UserModel = require("../models/user.js");

  var query = await UserModel.find({
    GetMailEveryDayAboutMyTasks: "yes"
  })
    .populate(options.includes)
    .exec(function(err, users) {
      if (err) {
        console.log("Can't get users");
      } else {
        SeparateArrayWithTimeout(users, MyTasksOfTodaySummary);
      }
      //next();
    });
};

//If we ever need to use as button in the UI == *AsButton*
exports.MyTasksOfTodaySummary = function(req, res, next) {};

function MyTasksOfTodaySummary(user) {
  var TaskModel = require("../models/task.js");

  var CheckRealDue = new Date();
  CheckRealDue.setHours(0, 0, 0, 0);
  
  //*AsButton*
  //var query = req.acl.mongoQuery('Task');
  //query.find({
  var query = TaskModel.find({
    //*AsButton* assign: req.user._id,
    assign: user._id,
    status: { $nin: ["rejected", "done"] },
    due: CheckRealDue,
    tType: { $ne: "template" }
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if (err) {
        //*AsButton* req.locals.error = {
        //   message: 'Can\'t get my tasks'
        // };
        console.log("Can't get my tasks");
      } else {
        //*AsButton* req.locals.result = tasks;

        var TodayTasks = [];

        tasks.forEach(function(task) {
            task.due.setDate(task.due.getDate() + 1);
            TodayTasks.push(task);
        });

        mailService
          .sendMyTasksOfTodaySummary("MyTasksOfTodaySummary", {
            TodayTasks: TodayTasks,
            //*AsButton* user: req.user
            user: user
          })
          .then(function() {
            //next();
          });
      }
      //next();
    });
}



exports.GetUsersWantGetGivenTodayTasksMail = async function() {
  var UserModel = require("../models/user.js");

  var query = await UserModel.find({
    GetMailEveryDayAboutGivenTasks: "yes"
  })
    .populate(options.includes)
    .exec(function(err, users) {
      if (err) {
        console.log("Can't get users");
      } else {
        SeparateArrayWithTimeout(users, GivenTasksOfTodaySummary);
      }
      //next();
    });
};

//If we ever need to use as button in the UI == *AsButton*
exports.GivenTasksOfTodaySummary = function(req, res, next) {};

function GivenTasksOfTodaySummary(user) {
  var TaskModel = require("../models/task.js");

  var CheckRealDue = new Date();
  CheckRealDue.setHours(0, 0, 0, 0);
  
  //*AsButton*
  //var query = req.acl.mongoQuery('Task');
  //query.find({
  var query = TaskModel.find({
    //*AsButton* assign: req.user._id,
    creator: user._id,
    status: { $nin: ["rejected", "done"] },
    due: CheckRealDue,
    tType: { $ne: "template" }
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if (err) {
        //*AsButton* req.locals.error = {
        //   message: 'Can\'t get my tasks'
        // };
        console.log("Can't get my tasks");
      } else {
        //*AsButton* req.locals.result = tasks;

        var TodayTasks = [];

        tasks.forEach(function(task) {
            task.due.setDate(task.due.getDate() + 1);
            TodayTasks.push(task);
        });

        mailService
          .sendMyTasksOfTodaySummary("GivenTasksOfTodaySummary", {
            TodayTasks: TodayTasks,
            //*AsButton* user: req.user
            user: user
          })
          .then(function() {
            //next();
          });
      }
      //next();
    });
}



exports.GetUsersWantGetMyWeeklyTasksMail = function() {
  var UserModel = require("../models/user.js");

  var query = UserModel.find({
    GetMailEveryWeekAboutMyTasks: "yes"
  })
    .populate(options.includes)
    .exec(function(err, users) {
      if (err) {
        console.log("Can't get users");
      } else {
        SeparateArrayWithTimeout(users, MyTasksOfNextWeekSummary);
      }
      //next();
    });
};

//If we ever need to use as button in the UI == *AsButton*
exports.MyTasksOfNextWeekSummary = function(req, res, next) {};

function MyTasksOfNextWeekSummary(user) {
  var TaskModel = require("../models/task.js");
  
  var CheckRealDue = new Date();
  CheckRealDue.setHours(0, 0, 0, 0);
  var CheckRealDueInWeek = new Date();
  CheckRealDueInWeek.setHours(CheckRealDueInWeek.getDate() + 7);
  CheckRealDueInWeek.setHours(0, 0, 0, 0);

  //*AsButton*
  //var query = req.acl.mongoQuery('Task');
  //query.find({
  var query = TaskModel.find({
    //*AsButton* assign: req.user._id,
    assign: user._id,
    status: { $nin: ["rejected", "done"] },
    due: {$gte: CheckRealDue, $lt: CheckRealDueInWeek},
    tType: { $ne: "template" }
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if (err) {
        //*AsButton* req.locals.error = {
        //   message: 'Can\'t get my tasks'
        // };
        console.log("Can't get my tasks");
      } else {
        //*AsButton* req.locals.result = tasks;

        var WeekTasks = [];

        tasks.forEach(function(task) {
            task.due.setDate(task.due.getDate() + 1);
            WeekTasks.push(task);
        });

        mailService
          .sendMyTasksOfNextWeekSummary("MyTasksOfNextWeekSummary", {
            WeekTasks: WeekTasks,
            //*AsButton* user: req.user
            user: user
          })
          .then(function() {
            //next();
          });
      }
      //next();
    });
}

exports.GetUsersWantGetGivenWeeklyTasksMail = function() {
  var UserModel = require("../models/user.js");

  var query = UserModel.find({
    GetMailEveryWeekAboutGivenTasks: "yes"
  })
    .populate(options.includes)
    .exec(function(err, users) {
      if (err) {
        console.log("Can't get users");
      } else {
        SeparateArrayWithTimeout(users, GivenTasksOfNextWeekSummary);
      }
      //next();
    });
};

//If we ever need to use as button in the UI == *AsButton*
exports.GivenTasksOfNextWeekSummary = function(req, res, next) {};

function GivenTasksOfNextWeekSummary(user) {
  //*AsButton* var query = req.acl.mongoQuery('Task');

  var TaskModel = require("../models/task.js");
  
  var CheckRealDue = new Date();
  CheckRealDue.setHours(0, 0, 0, 0);
  var CheckRealDueInWeek = new Date();
  CheckRealDueInWeek.setHours(CheckRealDueInWeek.getDate() + 7);
  CheckRealDueInWeek.setHours(0, 0, 0, 0);

  var query = TaskModel.find({
    //*AsButton* query.find({
    //creator: req.user._id,
    creator: user._id,
    due: {$gte: CheckRealDue, $lt: CheckRealDueInWeek},
    tType: { $ne: "template" }
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if (err) {
        // req undefined here
        //   req.locals.error = {
        //   message: 'Can\'t get my tasks'
        // };
      } else {

        var WeekTasks = [];

        tasks.forEach(function(task) {
            task.due.setDate(task.due.getDate() + 1);
            WeekTasks.push(task);
        });

        mailService
          .sendGivenTasksOfNextWeekSummary("GivenTasksOfNextWeekSummary", {
            WeekTasks: WeekTasks,
            user: user
          })
          .then(function() {
            //next();
          });
      }
      //next();
    });
}

/**
 *
 *
 * @param {*} tasks an array of tasks recieved by the task.all middleware
 * @param {*} columns what columns to display in the excel
 * @returns a promise that returns workbook
 */
async function tasksToExcelServiceFormat(tasks, columns, datesColumns) {
  let UpdateModel = require("../models/update");
  tasks = _.map(tasks, task => task._doc);
  let taskNotRecycled = task => !task.hasOwnProperty('recycled');
  let filteredTasks = _.filter(tasks, task => task.title && taskNotRecycled(task));
  let taskArray = await Promise.all(
    _.map(filteredTasks, async task => {
      let {
        _id,
        title,
        watchers,
        discussions,
        description,
        due,
        status,
        assign,
        tags,
        project,
        creator
      } = task;
      let updates = await UpdateModel.find({
        entity: new ObjectId(_id),
        updateField: "comment"
        // type: "comment"
      }).populate("creator", null, "User");
      let row = [
        title,
        //due&&due.toLocaleString().substr(0, due.toLocaleString().indexOf(' ')), // * gives the date as "year-month-day time" and removes time
        taskStatusMapper[status],
        assign && assign.name,
        _.map(watchers, watcher => watcher.name).join("\n"),
        description,
        creator && creator.name,
        discussions && discussions[0] && discussions[0].title,
        project && project.title,
        _.map(
          updates,
          update =>
            `:${update.date &&
              update.date
                .toLocaleString()
                .substr(0, update.date.toLocaleString().indexOf(" "))} - ${
              update.creator.name
            }` +
            "\n" +
            `${update.current}`
        ).join("\n"),
        tags.join("\n")
      ];

      return row;
    })
  );
  let taskDatesArray = await Promise.all(
    _.map(filteredTasks, async task => {
      let { _id, due } = task;
      let updates = await UpdateModel.find({
        entity: new ObjectId(_id),
        // _id: new ObjectId(_id),
        updateField: "comment"
      }).populate("creator", null, "User");
      let lastUpdate = _.last(updates);
      let lastUpdateDate = lastUpdate && lastUpdate.date;

      let row = [
        due, //&&due.toLocaleString().substr(0, due.toLocaleString().indexOf(' ')), // * gives the date as "year-month-day time" and removes time
        lastUpdateDate // _.map(updates,(update=>`:${update.updated&&update.updated.toLocaleString().substr(0, update.updated.toLocaleString().indexOf(' '))} - ${update.creator.name}`+"\n"+`${update.description}`) ).join("\n"),
      ];

      return row;
    })
  );
  return excelService.json2workbookWithDates({
    rows: taskArray,
    dates: taskDatesArray,
    columns,
    datesColumns,
    columnsBold: true
  });
}

exports.excel = function(req, res, next) {
  //return res.json(req.locals.result);

  //setting mime type as excel
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  //setting the name of the file to be downloaded
  res.attachment("Summary.xlsx");
  //  let columns = ["כותרת","תג"+"\""+"ב","סטטוס","אחראי","משתתפים","תיאור","יוצר המשימה","שם דיון","שם פרוייקט","עדכונים","תגיות"]
  let columns = [
    "כותרת",
    "סטטוס",
    "אחראי",
    "משתתפים",
    "תיאור",
    "יוצר המשימה",
    "שם דיון",
    "שם פרוייקט",
    "עדכונים",
    "תגיות"
  ];
  let datesColumns = ["תג" + '"' + "ב", "תאריך תגובה אחרון"];
  let tasks = req.locals.result;
  tasksToExcelServiceFormat(tasks, columns, datesColumns).then(summary => {
    res.send(summary);
  });
};

exports.byAssign = byAssign;
exports.myTasksStatistics = myTasksStatistics;
