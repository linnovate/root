/**
 * Created by shoshi on 10/15/15.
 */
var hi = require('./hi.js');

exports.createUserHi = function(req, res, next) {
    var options = {
        method: 'POST',
        form: {
            username: req.body.name,
            firstName: req.body.name,
            lastName: req.body.name,
            displayName: req.body.name
        },
        cmd: '/account/register'
    };

    hi.talkToHi(options, function(data, statusCode) {
        next();
    });
};
