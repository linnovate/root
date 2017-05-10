
module.exports = function(config, app) {

    if (app) {
        require('./routes')(app, config.rocketChat);
    }

    return {
        notify: function(services, fnc, params, callback){
            try {
                require('./hi')[fnc](config.rocketChat, params, callback);
            }
            catch(e) {
                console.log('error from notifications npm: You tried to access a function that does not exist: ' + fnc);    
            }
        }
    }
}