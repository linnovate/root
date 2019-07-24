"use strict";

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Actions, app, auth, database) {
  app.get("/actions/example/anyone", function(req, res, next) {
    res.send("Anyone can access this");
  });

  app.get("/actions/example/auth", auth.requiresLogin, function(
    req,
    res,
    next
  ) {
    res.send("Only authenticated users can access this");
  });

  app.get("/actions/example/admin", auth.requiresAdmin, function(
    req,
    res,
    next
  ) {
    res.send("Only users with Admin role can access this");
  });

  app.get("/actions/example/render", function(req, res, next) {
    Actions.render(
      "index",
      {
        package: "actions"
      },
      function(err, html) {
        //Rendering a view from the Package server/views
        res.send(html);
      }
    );
  });
};
