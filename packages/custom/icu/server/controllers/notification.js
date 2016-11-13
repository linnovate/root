// var Notification = require('../../../general/server/providers/notify.js').Notification;
// var Notify = new Notification();
var config = require('meanio').loadConfig();
var notifications = require('notifications')({rocketChat: config.rocketChat});
var projectController = require('./project.js');

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Message = mongoose.model('Message'),
  _ = require('lodash');
var UserCreator = mongoose.model('User');

var config = require('meanio').loadConfig();

//Made By OHAD
exports.read = function(req, res, next) {

  Message.find({
    title: req.user._id
  }).sort('time').populate('user', 'name username').exec(function(err, messages) {
    //console.log("--------------------------------------------------messages.find--------------------------------------");
    //console.log(messages);
    
    req.body = messages;
    
    res.json(messages);
  });
};

exports.updateIsWatched = function(req, res, next) { 

  Message.update(
  { id: req.params.id},
  { $set: { IsWatched : true}}
  ).exec(function(err, messages) {
    console.log("--------------------------------------------------messages.update--------------------------------------");
    console.log(messages);
    
    req.body = messages;
    
    res.json(messages);
  });
};
exports.updateDropDown = function(req, res, next) {

  Message.update(
  { title: req.params.id},
  { $set: { DropDownIsWatched : true}},
  { multi: true }
  ).exec(function(err, messages) {

    req.body = messages;
    
    res.json(messages);
  });
};
//END Made By OHAD

var generateRoomName = function(name, id) {
    if (!name || name === '') {
        name = new Date().toISOString().replace(/\..+/, '').replace(/:/, '-').replace(/:/, '-');
    }
    return name + '-' + id;
}

exports.createRoom = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }
    // Made By OHAD
    var ArrayOfusernames = [];

    // Get the username by the _id from the mongo.
    // There is callback so everything is in the callback
    UserCreator.findOne({
        _id: req.locals.result.creator
    }, function(err, user) {

        if (user && user.profile && user.profile.rcun) ArrayOfusernames.push(user.profile.rcun);

        // Check if there is watchers
        if (req.locals.result.watchers.length != 0) {
            req.locals.result.watchers.forEach(function(item) {
                if (item.profile && item.profile.rcun && ArrayOfusernames.indexOf(item.profile.rcun) < 0)
                    ArrayOfusernames.push(item.profile.rcun);
            });
        }
        console.log('ArrayOfusernames-----------')
        console.log(ArrayOfusernames)
        notifications.notify(['hi'], 'createRoom', {
            name: generateRoomName(req.locals.result.title, req.locals.result._id),
            message: 'message',
            members: ArrayOfusernames
        }, function(error, result) {
            if (error) {
                req.hi = {
                    error: error
                };
                next();
            } else {
                req.body.room = result[0].rid;

                projectController.update(req, res, next);
            }
        })

        //End Of callback    
    });
    // END Made By OHAD          

};

exports.updateRoom = function(req, res, next) {
        
    if (req.locals.error) {
        return next();
    }
    if (!req.locals.result.room) {
        exports.createRoom(req, res ,next);
    } else {
        if (req.locals.result.title !== req.locals.old.title)
            notifications.notify(['hi'], 'renameRoom', {name: generateRoomName(req.locals.result.title, req.locals.result._id), roomId:req.locals.result.room, message:'message'}, function(error, result){
            if (error) {
                req.hi = {error: error};
            } 
        })
        var added = req.locals.result.watchers.filter(function(o1){
            return !req.locals.old.watchers.some(function(o2){
                return o1.id === o2.id;
            });
        });
        for (var i in added) {
            notifications.notify(['hi'], 'addMember', {member: added[i].profile.rcun, roomId:req.locals.result.room}, function(error, result){
            })
        }

        var removed = req.locals.old.watchers.filter(function(o1){
            return !req.locals.result.watchers.some(function(o2){
                return o1.id === o2.id;
            });
        });
        for (var i in removed) {
            notifications.notify(['hi'], 'removeMember', {member: removed[i].profile.rcun, roomId:req.locals.result.room}, function(error, result){
            if (error) {
                req.hi = {error: error};
            } 
            })
        }

        next();
    }

};


exports.sendNotification = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }

    var data = req.locals.result;
	if (data.project && data.project.room) {
        var context = {
                action: 'added',
                type: 'task',
                name: data.title,
                user: req.user.username,
                url: config.host + '/tasks/by-project/' + data.project._id + '/' + data._id + '/activities'
            }
        notifications.notify(['hi'], 'createMessage', {message:bulidMassage(context),roomId:data.project.room}, function(error, result){
                if (error) {
                    req.hi = {error: error};
                } 
        })
    }

    next();
};

exports.sendUpdate = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }
    console.log('JSON.stringify(req.body)================================================================')

console.log(JSON.stringify(req.body))
	if (req.body.context.room) {
		req.body.context.user = req.user.name;
		
    notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:req.body.context.room}, function(error, result){
                if (error) {
                    req.hi = {error: error};
                } 
        })
	}

    next();
};


 var msgWithUrl = function(msg, url) {
    if (!url) return msg;
    return '[' + msg + '](' + url + ')';
};

var bulidMassage = function (context) {
    if(context.action == 'added')
        context.type = 'new ' + context.type;
    var msg = _.capitalize(context.type);
    if(context.name)
        msg += ' "' + context.name + '"';
    msg = msgWithUrl(msg, context.url);
    msg += ' was ' + context.action;
    //if(context.oldVal)
    //    msg += ' from "' + context.oldVal + '" to "' + context.newVal + ' "';
    if(context.issue)
        msg += ' to ' + msgWithUrl(context.issue + ' "' + context.issueName + '"', context.location);
    if(context.user)
        msg += ' by ' + _.capitalize(context.user);
    if(context.description)
        msg += ':\n"' + context.description + '"';

    return msg;
};