var Order = require("../models/order.js");

exports.set = function(req, res) {
  var entityName = req.body.entityName;
  var name;
  var qu = { name: req.body.main };
  if (req.body.elindex < req.body.dropindex) {
    qu.order = { $gte: req.body.elindex + 1, $lte: req.body.dropindex + 1 };
  } else {
    qu.order = { $gte: req.body.dropindex + 1, $lte: req.body.elindex + 1 };
  }
  if (req.body.main == "tasks") {
    qu.name = "Task";
    if (entityName == "project") {
      qu.project = req.body.entityId;
    } else if (entityName == "discussion") {
      qu.discussion = req.body.entityId;
    }
  } else if (req.body.main == "discussions") {
    qu.name = "Discussion";
    qu.project = req.body.entityId;
  } else if (req.body.main == "projects") {
    qu.name = "Project";
    qu.discussion = req.body.entityId;
  }

  if (req.body.elindex < req.body.dropindex) {
    Order.find(qu, function(err, data) {
      data.forEach(function(element) {
        if (element.order == req.body.elindex + 1) {
          if (req.body.size == req.body.dropindex) {
            update = { order: req.body.dropindex };
          } else {
            update = { order: req.body.dropindex + 1 };
          }
        } else {
          update = { order: (element.order -= 1) };
        }

        Order.update({ _id: element._id }, update, function(err, data) {
          if (err) {
            console.log(err);
          }
        });
      });
    });
  } else {
    Order.find(qu, function(err, data) {
      data.forEach(function(element) {
        if (element.order == req.body.elindex + 1) {
          // if(req.body.dropindex == 0){
          //    update = { order: req.body.dropindex}
          // }else{
          update = { order: req.body.dropindex + 1 };
          // }
        } else {
          update = { order: (element.order += 1) };
        }

        Order.update({ _id: element._id }, update, function(err, data) {
          if (err) {
            console.log(err);
          }
        });
      });
    });
  }
};

exports.addOrder = function(e, entity, Model) {
  var qu = {};
  var setOrder = new Order({ name: Model.modelName, ref: e._id });

  if (Model.modelName == "Task") {
    if (e.project) {
      qu = { project: e.project };
      setOrder.project = e.project;
    } else {
      qu = { discussions: e.discussions[0] };
      setOrder.discussion = e.discussions[0];
    }
  } else if (Model.modelName == "Project") {
    qu = { discussion: e.discussion };
    setOrder.discussion = e.discussion;
  } else if (Model.modelName == "Discussion") {
    qu = { project: e.project };
    setOrder.project = e.project;
  }
  Model.count(qu, function(err, data) {
    if (data) {
      setOrder.order = data;
      setOrder.save();
    }
  });
};

exports.deleteOrder = function(entity, Model) {
  var q = { name: Model.modelName };

  if (Model.modelName == "Task") {
    if (entity.project) {
      q.project = entity.project._id;
    } else if (entity.discussions.length > 1) {
      q.discussion = entity.discussions[0]._id;
    }
  } else if (Model.modelName == "Project") {
    if (entity.discussion) {
      q.discussion = entity.discussion;
    }
  } else if (Model.modelName == "Discussion") {
    if (entity.project) {
      q.project = entity.project;
    }
  }

  var qu = { name: Model.modelName, ref: entity._id };
  Order.findOne(qu, function(err, doc1) {
    if (doc1) {
      var orderNum = doc1.order;
      q.order = { $gte: orderNum };
      doc1.remove();
      Order.find(q, function(err, doc) {
        doc.forEach(function(element) {
          element.order -= 1;
          element.save();
        });
      });
    }
  });
};
