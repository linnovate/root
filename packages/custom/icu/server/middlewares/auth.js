'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function (req, res, next) {
    if (req.user) return next();
    if (!req.query.uid) {
        req.locals.error = {
            status: 403,
            message: 'User is not authorized'
        };
        return next();
    }

    User.findOne({
        uid: req.query.uid
    }, function (err, user) {
        if (err || !user) {
            req.locals.error = {
                status: 403,
                message: 'User is not authorized'
            };
            return next();
        }
        req.user = user;
        next();
    });
}

