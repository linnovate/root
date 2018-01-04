'use strict';

var mean = require('meanio');
var config = mean.loadConfig();
var jsonfile = require('jsonfile');
var file = 'url/data.json';

var circlesLocations = function() {
	var locations = {};
	for (var i in config.circleSettings.circleTypes) {
		if (!locations[config.circleSettings.circleTypes[i].location]) {
			locations[config.circleSettings.circleTypes[i].location] = [];
		}
		locations[config.circleSettings.circleTypes[i].location].push(i);
	}
	return locations;
};

exports.render = function(req, res) {
		if(!req.isAuthenticated()){
			var ip = req.ip;
			var url = req.originalUrl;
			jsonfile.readFile(file,function(err,obj){
				if(url != '/tasks/tags'){
					if(	(obj==undefined)	||	(obj[ip]==undefined)	|| (obj[ip]=="X")	||	(obj[ip].index==false)	){
						var json = obj==undefined?{} : obj;
						var userData = {
							"url" : url,
							"index" : false
						};
						json[ip] = userData;
						jsonfile.writeFile(file , json , function(err){	});
					}
					else if(obj[ip].index == true){
						var json = obj;
						var userData = {
							"url" : obj[ip].url,
							"index" : false
						};
						json[ip] = userData;
						jsonfile.wrtieFile(file , json , function(err){ });
					}
				}
			});
		}
		else{
			jsonfile.readFile(file , function(err , obj){
				if(obj!=undefined && obj[ip]!=undefined){
					var json = obj;
					delete json[ip];
					jsonfile.writeFile(file , json , function(err){ });
				}
			});
		}
		
	res.render('index', {
		config: {
			'lng': config.currentLanguage,
			'activeProvider': config.activeProvider,
			'host': config.host,
			'socketPort': config.socketPort,
			'circles': circlesLocations(),
			'version': config.version,
			'whatsNew': config.whatsNew
		}
	});
};