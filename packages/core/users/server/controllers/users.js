'use strict';

/**
 * Module dependencies.
 */

require('../../../../custom/circles/server/models/circle');

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Circle = mongoose.model('Circle'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template'),
  jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken

var GoogleService = require('serviceproviders')('google');
var service = new GoogleService(config.google.clientSecret, config.google.clientID, config.google.callbackURL);

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.redirect('/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
  var user = new User(req.body);

  user.provider = 'local';

  // because we set our user.provider to local our models/user.js validation will always be true
  req.assert('name', 'You must enter a name').notEmpty();
  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
  req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    console.log(JSON.stringify(errors))
    return res.status(400).send(errors);
  }

  // Hard coded for now. Will address this with the user permissions system in v0.3.5
  user.roles = ['authenticated'];
  user.save(function(err) {
    if (err) {
      console.log(err)
      switch (err.code) {
        case 11000:
        case 11001:
          res.status(400).json([{
            msg: 'Username already taken',
            param: 'username'
          }]);
          break;
        default:
          var modelErrors = [];

          if (err.errors) {

            for (var x in err.errors) {
              modelErrors.push({
                param: x,
                msg: err.errors[x].message,
                value: err.errors[x].value
              });
            }

            res.status(400).json(modelErrors);
          }
      }

      return res.status(400);
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      req.user = user;
      next();
    });
  });
};

exports.getJwt = function(req, res) {
  console.log(req.user)
  var payload = req.user;
  payload.redirect = req.body.redirect;
  var escaped = JSON.stringify(payload);
  escaped = encodeURI(escaped);
  // We are sending the payload inside the token
  ///var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
  var token = jwt.sign(escaped, config.secret, {
    // expiresInMinutes: 60 * 5
  });
  res.json({
    token: token
  });
  res.status(200);
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};

/**
 * Resets the password
 */

exports.resetpassword = function(req, res, next) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (err) {
      return res.status(400).json({
        msg: err
      });
    }
    if (!user) {
      return res.status(400).json({
        msg: 'Token invalid or expired'
      });
    }
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({
          user: user
        });
      });
    });
  });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
  var transport = nodemailer.createTransport(config.mailer);
  transport.sendMail(mailOptions, function(err, response) {
    if (err) return err;
    return response;
  });
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {
  async.waterfall([

      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({
          $or: [{
            email: req.body.text
          }, {
            username: req.body.text
          }]
        }, function(err, user) {
          if (err || !user) return done(true);
          done(err, user, token);
        });
      },
      function(user, token, done) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      },
      function(token, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.emailFrom
        };
        mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
        sendMail(mailOptions);
        done(null, true);
      }
    ],
    function(err, status) {
      var response = {
        message: 'Mail successfully sent',
        status: 'success'
      };
      if (err) {
        response.message = 'User does not exist';
        response.status = 'danger';
      }
      res.json(response);
    }
  );
};

exports.getGoogleGroups = function(req, res, next) {
  service.sdkManager('groups', 'list', {
    userKey: req.user.email,
  }, function(err, list) {
    if (!list || !list.groups) return next();
    var groups = list.groups.map(function(group) {
      return group.name;
    });
    req.user.circles.groups = groups;
    req.user.save(function(err) {
      next();
    });
  })
};

exports.setRandomPermissions = function(req, res, next) {
  // if (req.user.circles.permissions && req.user.circles.permissions.length) return next();
  // Circle.find({
  //   circleType: 'permissions'
  // }).exec(function(err, circles) {
  //   var rand = circles[Math.floor(Math.random() * circles.length)];
  //   req.user.circles.permissions = [rand.name];
  //   req.user.save(function(err) {
  //     console.log(err)
  next();
  //   });
  // })
};

exports.setRandomC19n = function(req, res, next) {
  if (req.user.circles.c19n && req.user.circles.c19n.length) return next();
  Circle.find({
    circleType: 'c19n'
  }).exec(function(err, circles) {
    var rand = circles[Math.floor(Math.random() * circles.length)];
    req.user.circles.c19n = [rand.name];
    req.user.save(function(err) {
      console.log(err)
      next();
    });
  })
};

exports.setRandomC19nGroups = function(req, res, next) {
  if (req.user.circles.c19nGroups1 && req.user.circles.c19nGroups1.length && req.user.circles.c19nGroups2 && req.user.circles.c19nGroups2.length) return next();
  Circle.find({
    circleType: 'c19nGroups1'
  }).exec(function(err, circles) {
    var rand = circles[Math.floor(Math.random() * circles.length)];
    req.user.circles.c19nGroups1 = [rand.name];
    Circle.find({
    circleType: 'c19nGroups2'
  }).exec(function(err, circles) {
    var rand = circles[Math.floor(Math.random() * circles.length)];
    req.user.circles.c19nGroups2 = [rand.name];
    req.user.save(function(err) {
      console.log(err)
      next();
    });
  })
  })
};