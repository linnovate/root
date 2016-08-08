'use strict';

var mean = require('meanio');
var config = mean.loadConfig();

exports.render = function(req, res) {
    res.render('index', {
        config: {'lng' : config.currentLanguage,
                'activeProvider': config.activeProvider,
              	'host': config.host, 
              	'socketPort' : config.socketPort}
     });
};
