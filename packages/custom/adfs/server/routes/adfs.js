'use strict';


var express = require('express');
var fs = require('fs');
module.exports = function(Adfs, app) {


app.get('/api/isAlive', function(req, res){
	res.send('Server Is Up');
})
	

	app.get('/metadata.xml', function(req,res,next) {
    fs.readFile(process.cwd()+'/packages/custom/adfs/credentials/public/metadata.xml', function (err, data) {
      if (err) {
        return next(err);
      }

      res.setHeader('content-type', 'application/xml');
      //this better work or a screen is breaking
      res.send(data);
    });
  })
};
