var Notification = require('../../../general/server/providers/notify.js').Notification;
var Notify = new Notification();

var projectController = require('../controllers/project.js');

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Message = mongoose.model('Message'),
  _ = require('lodash');
var UserCreator = mongoose.model('User');

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
//END Made By OHAD


exports.createRoom = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }

    // Made By OHAD
    var ArrayOfusernames = [];
 
    // Get the username by the _id from the mongo.
    // There is callback so everything is in the callback
    UserCreator.findOne({ _id: req.locals.result.creator}, function(err, user) {
        
        ArrayOfusernames.push(user.username);

        // Check if there is watchers
        if (req.locals.result.watchers.length != 0)
        {
            req.locals.result.watchers.forEach(function (item) {
                ArrayOfusernames.push(item.username);
            });
        }
        
        Notify.room('POST', {
            cmd: '/api/bulk/createPrivateRoom',
            headers: req.headers,
            rooms: {
                rooms:[{
                    //name: "Gal_Noy5",
                    //members: ['dvora5@linnovate.net','dvora6@linnovate.net','check', 'admin']
                    name: new Date().toISOString().replace(/\..+/, '').replace(/:/, '-').replace(/:/, '-'),
                    members: ArrayOfusernames
                }]
            }
        }, function(result) {
            req.body.room = result.id;

            projectController.update(req, res, next);
        });
    
    //End Of callback    
    });
    // END Made By OHAD          
               
};

exports.updateRoom = function(req, res, next) {
    console.log('====================================1============================================');      
        
    // Made By OHAD
    var ArrayOfusernames = [];

    // Get the username by the _id from the mongo.
    // There is callback so everything is in the callback
    UserCreator.findOne({ _id: req.locals.result.creator}, function(err, user) {
        
        ArrayOfusernames.push(user.username);
        
        // Check if there is watchers
        if (req.locals.result.watchers.length != 0)
        {
            req.locals.result.watchers.forEach(function (item) {
                ArrayOfusernames.push(item.username);
            });
        }
        
        if (req.locals.error) {
            return next();
        }
        if (!req.locals.result.room) {
            exports.createRoom(req, res ,next);
        } else {

            Notify.room('PUT', {
                cmd: '/api/bulk/updatePrivateRoom',
                headers: req.headers,
                rooms: {
                    rooms: [{
                        id: req.locals.result.room,
                        name: req.locals.result.title,
                        //usernames: ['check', 'admin']
                        usernames: ArrayOfusernames
                    }]
                }
            } ,function(result) {
                
            // req.body.room = result.id;

            projectController.update(req, res, next);
        }
            );
        }
    
    //End Of callback
    });
            
    // END Made By OHAD         
};


exports.sendNotification = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }

    var data = req.locals.result;
	if (data.project && data.project.room) {
		Notify.sendMessage({
			headers: req.headers,
			room: data.project.room,
			context: {
                action: 'added',
                type: 'task',
                name: data.title,
                user: req.user.username
            }
		});
    }

    next();
};

exports.sendUpdate = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }

	if (req.body.context.room) {
		req.body.context.user = req.user.name;
		Notify.sendMessage({
			headers: req.headers,
			room: req.body.context.room,
			context: req.body.context
		} ,function(result) {
            console.log("--------------------------------------------------sendUpdate- GAL--------------------------------------");
        });
	}

    next();
};