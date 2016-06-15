var mongoose = require('mongoose'),
    Circle = mongoose.model('Circle'),
    Source = mongoose.model('Source'),
    actionSettings = require(process.cwd() + '/config/actionSettings') || {};

module.exports = function(Circles, app) {

    return {

        test: function(req, res) {
            var query = req.acl.query('Article');

            query.find({}, function(err, data) {
                res.send(data)
            })
        },

        visualize: function(req, res) {
            Circles.render('index', {}, function(err, html) {
                res.send(html);
            });
        },

        tree: function(req, res) {
            Circle.buildPermissions(function(data) {
                res.send(data.tree);
            });
        },

        create: function(req, res) {

            var circle = new Circle(req.body);

            circle.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the circle'
                    });
                }

                Circle.buildPermissions(function(data) {
                    app.set('circles', data);
                });

                res.json(circle);
            });
        },

        update: function(req, res) {

            if (!req.params.name) return res.send(404, 'No name specified');

            validateCircles(req.params.name, req.body.circles, function(err, status) {

                if (err) return res.send(400, status);

                Circle.findOne({
                    name: req.params.name
                }).exec(function(err, circle) {
                    if (!err && circle) {
                        Circle.findOneAndUpdate({
                            name: circle.name
                        }, {
                            $set: req.body
                        }, {
                            multi: false,
                            upsert: false
                        }, function(err, circle) {
                            if (err) {
                                return res.send(500, err.message);
                            }

                            Circle.buildPermissions(function(data) {
                                app.set('circles', data);
                            });

                            res.send(200, 'updated');
                        });
                    }
                });
            });
        },
        mine: function(req, res) {
            var descendants = {};
            for (var type in req.acl.user.circles) {
                descendants[type] = {};
                for (var index in req.acl.user.circles[type]) {
                    descendants[type][index] = req.acl.user.circles[type][index].decendants;
                }
            }
            return res.send({
                allowed: req.acl.user.allowed,
                descendants: descendants
            });
        },
        all: function(req, res) {
            return res.send({
                tree: req.acl.tree,
                circles: req.acl.circles
            });
        },
        show: function(req, res) {
            return res.send('show');
        },
        loadCircles: function(req, res, next) {
            var data = app.get('circles');


            if (!req.acl) req.acl = {};

            if (!data) {
                Circle.buildPermissions(function(data) {
                    app.set('circles', data);
                    req.acl.tree = data.tree;
                    req.acl.circles = data.circles;

                    next();
                });
            } else {
                req.acl.tree = data.tree;
                req.acl.circles = data.circles;
                next();
            }
        },
        userAcl: function(req, res, next) {
            var circleTypes = {
                c19n: req.user && req.user.circles && req.user.circles.c19n ? req.user.circles.c19n : [],
                c19nGroups1: req.user && req.user.circles && req.user.circles.c19nGroups1 ? req.user.circles.c19nGroups1 : [],
                c19nGroups2: req.user && req.user.circles && req.user.circles.c19nGroups2 ? req.user.circles.c19nGroups2 : [],
                groups: req.user && req.user.circles && req.user.circles.groups ? req.user.circles.groups : [],
                permissions: req.user && req.user.circles && req.user.circles.permissions ? req.user.circles.permissions : []
            };

            var userRoles = {};
            var list = {};

            //
            for (var type in circleTypes) {
                userRoles[type] = {};
                list[type] = [];
                circleTypes[type].forEach(function(circle) {
                    if (req.acl.circles[type][circle]) {

                        if (list[type].indexOf(circle) === -1) list[type].push(circle);
                        req.acl.circles[type][circle].decendants.forEach(function(descendent) {

                            if (list[type].indexOf(descendent) === -1) {
                                list[type].push(descendent);
                            }

                        });
                        userRoles[type][circle] = req.acl.circles[type][circle];
                    }
                });
            };

            var tree = Circle.buildTrees(userRoles);

            for (var index in tree) {
                tree[index].children = req.acl.tree[index].children;
            }

            req.acl.user = {
                tree: tree,
                circles: userRoles,
                allowed: list,
            };

            return next();
        },
        aclBlocker: function(req, res, next) {
            req.acl.query = function(model) {

                if (!Circles.models[model]) {
                    Circles.models[model] = mongoose.model(model);
                }
                var conditions = {
                    $and: []
                };
                var groups = ['c19nGroups1', 'c19nGroups2', 'c19n'];

                for (var i in groups) {
                    var obj1 = {},
                        obj2 = {},
                        obj3 = {};
                    obj1['circles.'+groups[i]] = {$in: req.acl.user.allowed[groups[i]]}; 
                    obj2['circles.'+groups[i]] = {$size: 0};
                    obj3['circles.'+groups[i]] = {$exists: false};
                    conditions.$and.push({'$or': [obj1, obj2, obj3]});
                }
                console.log(JSON.stringify(conditions))
                return Circles.models[model].where(conditions);
            };

            next();
        },
        sources: function(req, res) {
            var conditions = {};
            if(!actionSettings.displayAllSources)
                conditions.circleName = {$in: req.acl.user.allowed.c19n};
            Source.find(conditions).exec(function(err, sources) {
                res.send(sources);
            });
        }
    }

};



function validateCircles(name, circles, callback) {

    Circle.buildPermissions(function(data) {
        circles = [].concat(circles);

        circles.forEach(function(parent, index) {

            if (data.circles[name].decendants.indexOf(parent) !== -1) {
                return callback(true, 'Cannot reference parent in child relationship')
            }
            if (index === circles.length - 1) {
                return callback(null, 'valid');
            }
        });
    });
}

/*

,
        userRoles: function(req, res, next) {


            var roles = req.user && req.user.roles ? req.user.roles : ['annonymous'];

            var myRoles = {};

            roles.forEach(function(role) {
                if (req.circles[role]) {
                    myRoles[role] = req.circes[role];
                }
            });

            return myRoles;
        }
*/