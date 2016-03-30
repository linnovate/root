var Notification = require('../../../general/server/providers/notify.js').Notification;
var Notify = new Notification();

var projectController = require('../controllers/project.js');

exports.createRoom = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }

    Notify.room('POST', {
        headers: req.headers,
        project: req.body
    }, function(result) {
        req.body.room = result.id;

        projectController.update(req, res, next);
    });
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
		});
	}

    next();
};
