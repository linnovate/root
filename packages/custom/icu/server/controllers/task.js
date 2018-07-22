'use strict';

var _ = require('lodash');
// var q = require('q');
var async = require('async');
var config = require('meanio').loadConfig();

var options = {
  includes: 'assign watchers project subTasks discussions',
  defaults: {
    project: undefined,
    assign: undefined,
    discussions: [],
    watchers: [],
    circles: {}
  },
  conditions: {
    tType: {
      $ne: 'template'
    },
    $or: [
      {
        parent: null
      }, {
        parent: {
          $exists: false
        }
      }
    ]
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var task = crud('tasks', options);
var Project = require('../controllers/project');
var mailService = require('../services/mail');

var Task = require('../models/task'),
  Discussion = require('../models/discussion'),
  mean = require('meanio');

var Order = require('../models/order');

Object.keys(task).forEach(function(methodName) {
  if(methodName !== 'create' && methodName !== 'update') {
    exports[methodName] = task[methodName];
  }
});

Date.prototype.getThisDay = function () {
  var date = new Date();
  // return [date.setHours(0,0,0,0), date.setHours(23,59,59,999)];
  return [
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  ];
};

Date.prototype.getWeek = function () {
  var today = new Date(this.setHours(0, 0, 0, 0));
  var date = today.getDate() - today.getDay();

  var StartDate = new Date(today.setDate(date));
  var EndDate = new Date(today.setDate(StartDate.getDate() + 6));
  // EndDate.setHours(23,59,59,999);
  // return [StartDate, EndDate];
  return [
    Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate(), 0, 0, 0, 0),
    Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 999)
  ];
};


exports.create = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  req.body.discussions = [];
  if(req.body.discussion) {
    req.body.discussions = [req.body.discussion];
    req.body.tags = [];
    Discussion.findById(req.body.discussion, function(err, discussion) {
      if(discussion && discussion.project) {
        req.body.project = discussion.project;
      }
      task.create(req, res, next);
    });
  }
  else task.create(req, res, next);
};

exports.update = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  req.locals.action = 'update';
  if(req.body.discussion) {
    var alreadyAdded = _(req.locals.result.discussions).any(function(d) {
      return d.toString() === req.body.discussion;
    });

    if(!alreadyAdded) {
      req.body.discussions = req.locals.result.discussions;
      req.body.discussions.push(req.body.discussion);
    }
  }

  if(req.body.subTasks && req.body.subTasks.length && !req.body.subTasks[req.body.subTasks.length - 1]._id) {
    req.body.subTasks.pop();
  }

  task.update(req, res, next);
};

exports.tagsList = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Task');
  query.distinct('tags', function(error, tags) {
    if(error) {
      req.locals.error = {
        message: 'Can\'t get tags'
      };
    }
    else {
      req.locals.result = tags || [];
    }

    next();
  });

  // var query = {
  //   'query': {
  //     'query_string': {
  //       'query': '*'
  //     }
  //   },
  //   'facets': {
  //     'tags': {
  //       'terms': {
  //         'field': 'tags'
  //       }
  //     }
  //   }
  // };

  // mean.elasticsearch.search({
  //   index: 'task',
  //   'body': query,
  //   size: 3000
  // }, function(err, response) {
  //   if (err) {
  //     req.locals.error = {
  //       message: 'Can\'t get tags'
  //     };
  //   } else {
  //     req.locals.result = response.facets ? response.facets.tags.terms : [];
  //   }

  //   next();
  // });
};

exports.getByEntity = function (req, res, next) {

  if(req.locals.error) {
    return next();
  }

  var entities = {
      projects: 'project',
      users: 'assign',
      discussions: 'discussions',
      tags: 'tags'
    },
    entityQuery = {
      tType: {
        $ne: 'template'
      },
      $or: [
        {
          parent: null
        }, {
          parent: {
            $exists: false
          }
        }
      ]
    };
  entityQuery[entities[req.params.entity]] = req.params.id instanceof Array ? {
    $in: req.params.id
  } : req.params.id;

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if(ids && ids.length) {
    entityQuery._id = {
      $in: ids
    };
    starredOnly = true;
  }
  var query = req.acl.mongoQuery('Task');

  query.find(entityQuery);
  query.populate(options.includes);

  Task.find(entityQuery).count({}, function (err, c) {
    req.locals.data.pagination.count = c;


    var pagination = req.locals.data.pagination;
    if(pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
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
      if(err) {
        req.locals.error = {
          message: 'Can\'t get tags'
        };
      }
      else if(starredOnly) {
        tasks.forEach(function(task) {
          task.star = true;
        });
      }
      if(pagination.sort == 'custom') {
        var temp = new Array(tasks.length);
        var tasksTemp = tasks;
        Order.find({name: 'Task', project: tasks[0].project}, function(err, data) {
          data.forEach(function(element) {
            for(var index = 0; index < tasksTemp.length; index++) {
              if(JSON.stringify(tasksTemp[index]._id) === JSON.stringify(element.ref)) {
                temp[element.order - 1] = tasks[index];
              }

            }
          });
          tasks = temp;
          req.locals.result = tasks;
          next();
        });
      }
      else {
        req.locals.result = tasks;

        next();
      }
    });
  });


};

exports.getZombieTasks = function(req, res, next) {
  if(req.locals.error) {
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
    tType: { $ne: 'template' }
  });
  Query.populate(options.includes);

  Query.exec(function(err, tasks) {
    if(err) {
      req.locals.error = {
        message: 'Can\'t get zombie tasks'
      };
    }
    else {
      req.locals.result = tasks;
    }

    next();
  });
};

var byAssign = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  var query = req.acl.mongoQuery('Task');
  query.find({
    assign: req.user._id,
    status: {$nin: ['rejected', 'done']},
    tType: {$ne: 'template'}
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if(err) {
        req.locals.error = {
          message: 'Can\'t get my tasks'
        };
      }
      else {
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
          }, {
            term: {
              assign: req.user._id
            }
          }
        ],
        must_not: [
          {
            terms: {
              status: ['rejected', 'done'],
              //"execution" : "and"
            }
          },
          {
            term: {tType: 'template'}
          }
        ]
      }
    }
  };
  tasksFromElastic(query, 'TasksDueToday', callback);
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
          }, {
            term: {
              assign: req.user._id
            }
          }
        ],
        must_not: [
          {
            terms: {
              status: ['rejected', 'done'] //,
            // "execution" : "and"
            }
          },
          {
            term: {tType: 'template'}
          }
        ]
      }
    }
  };
  tasksFromElastic(query, 'TasksDueWeek', callback);
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
            },
          }, {
            term: {
              assign: req.user._id
            }
          }
        ],
        must_not: [
          {
            terms: {
              status: ['rejected', 'done'] //,
            //"execution" : "and"
            }
          },
          {
            term: {tType: 'template'}
          }
        ]
      }
    }
  };
  tasksFromElastic(query, 'OverDueTasks', callback);
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
          }, {
            terms: {
              status: ['rejected', 'done'] //,
            //"execution" : "and"
            }
          },
          {
            term: {tType: 'template'}
          }
        ]
      }
    }
  };
  tasksFromElastic(query, 'WatchedTasks', callback);
}

function tasksFromElastic(query, name, callback) {
  mean.elasticsearch.search({
    index: 'task',
    body: query,
  }, function(err, response) {
    if(err) {
      callback(err);
    }
    else {
      //   req.locals.result = response.hits.hits.map(function (item) {
      //     return item._source;
      // })
      callback(null, {
        key: name,
        value: response.hits.total
      });
    }
  });
}


function myTasksStatistics(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  async.parallel([

    function (callback) {
      getTasksDueTodayQuery(req, callback);
    },
    function (callback) {
      getTasksDueWeekQuery(req, callback);
    },
    function (callback) {
      getOverDueTasksQuery(req, callback);
    },
    function (callback) {
      getWatchedTasksQuery(req, callback);
    }
  ], function (err, result) {
    req.locals.result = result;
    req.locals.error = err;
    next();
  });
}

exports.getWatchedTasks = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  Task.find({
    watchers: req.user._id,
    assign: {
      $ne: req.user._id
    },
    status: {
      $nin: ['rejected', 'done']
    },
    tType: {$ne: 'template'}
  }, function(err, response) {
    var length = Object.keys(response).length;
    if(err) {
      req.locals.error = err;
    }
    else {
      res.send(length.toString());
      req.locals.result = response;
    }
    next();
  });
};


exports.getWatchedTasksList = function (req, res, next) {
  //if (req.locals.error) {
  //  return next();
  //}
  Task.find({
    watchers: req.user._id,
    assign: {
      $ne: req.user._id
    },
    status: {
      $nin: ['rejected', 'done']
    },
    tType: {$ne: 'template'}
  }, function(err, response) {
    if(err) {
      req.locals.error = err;
    }
    else {
      res.send(response);
      req.locals.result = response;
    }
    //next();
  });
};


exports.getOverdueWatchedTasks = function(req, res, next) {
  // if (req.locals.error) {
  //   return next();
  // }

  var dates = new Date().getThisDay();
  Task.find({
    watchers: req.user._id,
    assign: {
      $ne: req.user._id
    },
    status: {
      $nin: ['rejected', 'done']
    },
    due: {
      $lt: dates[0]
    },
    tType: {$ne: 'template'}
  }, function(err, response) {
    if(err) {
      req.locals.error = err;
    }
    else {
      req.locals.result = response;
      res.send(response);
    }
  //  next();
  });
};

exports.getSubTasks = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  var query = req.acl.mongoQuery('Task');
  query.findOne({
    _id: req.params.id,
    tType: {$ne: 'template'}
  }, {
      subTasks: 1
    })
    .populate('subTasks')
    .deepPopulate('subTasks.subTasks subTasks.watchers')
    .exec(function(err, task) {
      if(err) {
        req.locals.error = err;
      }
      else if(task) {
        req.locals.result = task.subTasks;
      }
      next();
    });
};

exports.updateParent = function(req, res, next) {
  if(req.locals.error || !req.body.parent) {
    return next();
  }
  var data = {
    $push: {
      subTasks: req.locals.result._id
    }
  };
  Task.findOneAndUpdate({
    _id: req.body.parent,
    tType: {$ne: 'template'}
  }, data, function(err, task) {
    if(err) {
      req.locals.error = err;
    }
    next();
  });

};

exports.removeSubTask = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  Task.findOne({
    _id: req.params.id,
    tType: {$ne: 'template'}
  }, function(err, subTask) {
    if(err) {
      req.locals.error = err;
    }
    else {
      Task.update({
        _id: subTask.parent,
        tType: {$ne: 'template'}
      }, {
        $pull: {
          subTasks: subTask._id
        }
      }, function(err, task) {
        if(err) {
          req.locals.error = err;
        }
        next();
      });
    }
  });
};

exports.populateSubTasks = function (req, res, next) {
  Task.populate(req.locals.result, {
    path: 'subTasks.watchers',
    model: 'User'
  }, function(err, tasks) {
    if(err) {
      req.locals.error = err;
    }
    else req.locals.result = tasks;
    next();
  });
};


exports.GetUsersWantGetMyTodayTasksMail = function () {

  var UserModel = require('../models/user.js');

  var query = UserModel.find({
    GetMailEveryDayAboutMyTasks: 'yes'
  })
    .populate(options.includes)
    .exec(function(err, users) {
      if(err) {
        console.log('Can\'t get users');
      }
      else {

        users.forEach(function(user) {
          MyTasksOfTodaySummary(user._doc);
        });

      }
      //next();
    });

};

//If we ever need to use as button in the UI == *AsButton*
exports.MyTasksOfTodaySummary = function(req, res, next) {};

function MyTasksOfTodaySummary(user) {

  var TaskModel = require('../models/task.js');

  //*AsButton*
  //var query = req.acl.mongoQuery('Task');
  //query.find({
  var query = TaskModel.find({
    //*AsButton* assign: req.user._id,
    assign: user._id,
    status: { $nin: ['rejected', 'done'] },
    tType: { $ne: 'template' }
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if(err) {
      //*AsButton* req.locals.error = {
      //   message: 'Can\'t get my tasks'
      // };
        console.log('Can\'t get my tasks');
      }
      else {
      //*AsButton* req.locals.result = tasks;

        var curr = new Date();
        curr.setHours(0, 0, 0, 0);
        var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));

        var TodayTasks = [];

        tasks.forEach(function(task) {
          var due = new Date(task.due);
          //if (due >= date[0] && due <= date[1]) {
          if(due.getDay() == firstday.getDay()) {
            task.due.setDate(task.due.getDate() + 1);
            TodayTasks.push(task);
          }
        });

        mailService.sendMyTasksOfTodaySummary('MyTasksOfTodaySummary', {
          TodayTasks: TodayTasks,
          //*AsButton* user: req.user
          user: user
        }).then(function() {
        //next();
        });
      }
      //next();
    });

}


exports.GetUsersWantGetMyWeeklyTasksMail = function () {

  var UserModel = require('../models/user.js');

  var query = UserModel.find({
    GetMailEveryWeekAboutMyTasks: 'yes'
  })
    .populate(options.includes)
    .exec(function(err, users) {
      if(err) {
        console.log('Can\'t get users');
      }
      else {

        users.forEach(function(user) {
          MyTasksOfNextWeekSummary(user._doc);
        });

      }
      //next();
    });

};

//If we ever need to use as button in the UI == *AsButton*
exports.MyTasksOfNextWeekSummary = function(req, res, next) {};

function MyTasksOfNextWeekSummary(user) {

  var TaskModel = require('../models/task.js');

  //*AsButton*
  //var query = req.acl.mongoQuery('Task');
  //query.find({
  var query = TaskModel.find({
    //*AsButton* assign: req.user._id,
    assign: user._id,
    status: { $nin: ['rejected', 'done'] },
    tType: { $ne: 'template' }
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if(err) {
      //*AsButton* req.locals.error = {
      //   message: 'Can\'t get my tasks'
      // };
        console.log('Can\'t get my tasks');
      }
      else {
      //*AsButton* req.locals.result = tasks;

        var curr = new Date();
        curr.setHours(0, 0, 0, 0);
        var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
        var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
        lastday = new Date(lastday.setHours(23, 59, 59, 0));
        var date = [firstday, lastday];

        var WeekTasks = [];

        tasks.forEach(function(task) {
          var due = new Date(task.due);
          if(due >= date[0] && due <= date[1]) {
            task.due.setDate(task.due.getDate() + 1);
            WeekTasks.push(task);
          }
        });

        mailService.sendMyTasksOfNextWeekSummary('MyTasksOfNextWeekSummary', {
          WeekTasks: WeekTasks,
          //*AsButton* user: req.user
          user: user
        }).then(function() {
        //next();
        });
      }
      //next();
    });

}


exports.GetUsersWantGetGivenWeeklyTasksMail = function () {

  var UserModel = require('../models/user.js');

  var query = UserModel.find({
    GetMailEveryWeekAboutGivenTasks: 'yes'
  })
    .populate(options.includes)
    .exec(function(err, users) {
      if(err) {
        console.log('Can\'t get users');
      }
      else {

        users.forEach(function(user) {
          GivenTasksOfNextWeekSummary(user._doc);
        });
      }
      //next();
    });

};

//If we ever need to use as button in the UI == *AsButton*
exports.GivenTasksOfNextWeekSummary = function(req, res, next) {};

function GivenTasksOfNextWeekSummary(user) {

  //*AsButton* var query = req.acl.mongoQuery('Task');

  var TaskModel = require('../models/task.js');

  var query = TaskModel.find({
    //*AsButton* query.find({
    //creator: req.user._id,
    creator: user._id,
    tType: {$ne: 'template'}
  })
    .populate(options.includes)
    .exec(function(err, tasks) {
      if(err) {
        // req undefined here
        //   req.locals.error = {
        //   message: 'Can\'t get my tasks'
        // };
      }
      else {

        var curr = new Date();
        curr.setHours(0, 0, 0, 0);
        var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
        var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
        lastday = new Date(lastday.setHours(23, 59, 59, 0));
        var date = [firstday, lastday];

        var WeekTasks = [];

        tasks.forEach(function (task) {
          var due = new Date(task.due);
          if(due >= date[0] && due <= date[1]) {
            task.due.setDate(task.due.getDate() + 1);
            WeekTasks.push(task);
          }
        });

        mailService.sendGivenTasksOfNextWeekSummary('GivenTasksOfNextWeekSummary', {
          WeekTasks: WeekTasks,
          user: user
        }).then(function() {
          //next();
        });
      }
      //next();
    });

}


exports.excel = function (req, res, next) {

  var path = '/notes';

  var UserModel = require('../models/user.js');

  console.log('exal-------------------------');
  // Require library
  var excel = require('excel4node');

  // Create a new instance of a Workbook class
  var workbook = new excel.Workbook();

  // Add Worksheets to the workbook
  var worksheet = workbook.addWorksheet('Sheet 1');

  // Create a reusable style
  var style = workbook.createStyle({
    alignment: {
      horizontal: 'distributed'
    },
    font: {
      color: '000000',
      size: 12
    },
    umberFormat: 'dd-mm-yyyy'
  });

  // Create a reusable style
  var styleHead = workbook.createStyle({
    alignment: {
      horizontal: 'distributed'
    },
    font: {
      color: '#FF0800',
      size: 16
    },
    umberFormat: 'dd-mm-yyyy'
  });

  worksheet.cell(1, 1).string('כותרת').style(styleHead);
  worksheet.cell(1, 2).string('תג"ב').style(styleHead);
  worksheet.cell(1, 3).string('סטטוס').style(styleHead);
  worksheet.cell(1, 4).string('אחראי').style(styleHead);
  worksheet.cell(1, 5).string('משתתפים').style(styleHead);
  worksheet.cell(1, 6).string('תיאור').style(styleHead);
  worksheet.cell(1, 7).string('יוצר המשימה').style(styleHead);


  var numOfRow = 2;
  var assignArray = [];
  assignArray[0] = '';
  var IndexOfassignArray = 1;
  var creatorArray = [];
  creatorArray[0] = '';
  var IndexOfcreatorArray = 1;
  var toWrite = '';

  for(var index = 0; index < req.locals.result.length; index++) {

    if(req.locals.result[index]._doc.title) {
      worksheet.cell(numOfRow, 1).string(req.locals.result[index]._doc.title).style(style);
    }

    if(req.locals.result[index]._doc.due) {
      worksheet.cell(numOfRow, 2).date(req.locals.result[index]._doc.due).style(style);
    }

    if(req.locals.result[index]._doc.status) {
      worksheet.cell(numOfRow, 3).string(req.locals.result[index]._doc.status).style(style);
    }

    if(req.locals.result[index]._doc.assign) {
      var query = UserModel.findOne({
        _id: req.locals.result[index]._doc.assign._doc._id
      });
      assignArray[assignArray.length] = numOfRow;
      query.then(function(user) {
      //worksheet.cell(numOfRow,4).string(user._doc.name).style(style);
        worksheet.cell(assignArray[IndexOfassignArray], 4).string(user._doc.name).style(style);
        workbook.write(config.attachmentDir + path + '/' + req.user.id + 'Tasks.xlsx');
        IndexOfassignArray++;
      });

    }

    if(req.locals.result[index]._doc.watchers.length > 1) {
      for(var numOfWatchers = 0;
        numOfWatchers < req.locals.result[index]._doc.watchers.length;
        numOfWatchers++) {

        toWrite = toWrite + ',' + req.locals.result[index]._doc.watchers[numOfWatchers]._doc.name;
      }

      worksheet.cell(numOfRow, 5).string(toWrite).style(style);
      toWrite = '';
    }

    if(req.locals.result[index]._doc.description) {
      worksheet.cell(numOfRow, 6).string(req.locals.result[index]._doc.description).style(style);
    }

    if(req.locals.result[index]._doc.creator) {
      var query = UserModel.findOne({
        _id: req.locals.result[index]._doc.creator
      });
      creatorArray[creatorArray.length] = numOfRow;
      query.then(function(user) {
      //worksheet.cell(numOfRow,7).string(req.locals.result[index]._doc.creator).style(style);
        worksheet.cell(creatorArray[IndexOfcreatorArray], 7).string(user._doc.name).style(style);
        workbook.write(config.attachmentDir + path + '/' + req.user.id + 'Tasks.xlsx');
        IndexOfcreatorArray++;
      });
    }

    numOfRow++;
  }



  workbook.write(config.attachmentDir + path + '/' + req.user.id + 'Tasks.xlsx');

  next();
};

exports.byAssign = byAssign;
exports.myTasksStatistics = myTasksStatistics;
