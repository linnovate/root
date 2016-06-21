/**
 * Created by shoshi on 10/19/15.
 */
var letschatConfig = require('meanio').loadConfig().letschat,
	rocketChat = require('meanio').loadConfig().rocketChat,
    request = require('request');

exports.proxy = function(req, res) {
    var options = {
        method: req.method,
        form: req.body,
        cmd: req.url.replace('/api/hi', '')
    };

    if(options.cmd === '/users')
        options.cmd = '/account/register';
    else if( options.cmd.indexOf('owner') != -1 ) {
        options.form.owner = options.cmd.match(/[^/]*$/, '')[0];
        options.cmd = options.cmd.replace(/owner[/][^/]*$/, '');

    }

    exports.talkToHi(options, function(data, statusCode) {
        res.status(statusCode);
        res.json(data);
    });

};

exports.talkToHi = function(options, callback) {
	var param = options.param ? '/' + options.param : '';
    var objReq = {
        uri: letschatConfig.uri + options.cmd + param,
        method: options.method,
        headers: {}
    };

    if(options.cmd != '/account/register')
        objReq.headers['Authorization'] = "Bearer " + letschatConfig.token;

    if (options.form) {
        objReq.form = options.form;
        objReq.headers['Content-Type'] = 'multipart/form-data';
    }

    request(objReq, function(error, response, body) {
        if (!error && response.body.length && response.statusCode < 300) {
            return callback(JSON.parse(body), response.statusCode);
        }
        callback(error ? error : body, response ? response.statusCode : 500);

    });
}

exports.talkToRocketChat = function(options, callback) {
	console.log('================================================talkToRocketChat======================================')
	
	// Logon with REST API
	// var objReq = {
 //        uri: 'https://hirc.herokuapp.com/api/login',
 //        method: 'POST',
 //        form: {
 //        	'password': '12345678',
 //        	'user': 'dvora1'
 //        }
 //    };
 // 	curl https://hirc.herokuapp.com/api/login -d "password=newstart&user=dvora"


	// Get list of public rooms via REST API
	// var objReq = {
 //        uri: 'https://hirc.herokuapp.com/api/publicRooms',
 //        method: 'GET',
 //        headers: {
 //        	'X-Auth-Token': 'YVJ2OYTfogk6N9WlKU5MASvdinhcEe9yS6rt8m5-gwr',
 //        	'X-User-Id': 'zbSw4y5awAMEpRs5W'
 //        }
 //    };

    // curl -H "X-Auth-Token: YVJ2OYTfogk6N9WlKU5MASvdinhcEe9yS6rt8m5-gwr" -H "X-User-Id: zbSw4y5awAMEpRs5W" https://hirc.herokuapp.com/api/publicRooms


  	//Sending a message via REST API
    // var objReq = {
    //     uri: 'https://hirc.herokuapp.com/api/rooms/Miq67HniQKzfxj7RX/send',
    //     method: 'POST',
    //     headers: {
    //     	'X-Auth-Token': 'YVJ2OYTfogk6N9WlKU5MASvdinhcEe9yS6rt8m5-gwr',
    //     	'X-User-Id': 'zbSw4y5awAMEpRs5W',
    //     	'Content-Type': 'application/json'
    //     },
    //     form: {
    //     	'msg': 'This is a message from api'
    //     }
    // };

    // curl -H "X-Auth-Token: YVJ2OYTfogk6N9WlKU5MASvdinhcEe9yS6rt8m5-gwr" -H "Content-Type: application/json" -X POST -H "X-User-Id: zbSw4y5awAMEpRs5W" https://hirc.herokuapp.com/api/rooms/GENERAL/send -d "{ \"msg\" : \"OK\" }"


    // create channel
    // var objReq = {
    //     uri: rocketChat.uri + '/api/bulk/createRoom',
    //     method: 'POST',
    //     headers: {
    //     	'X-Auth-Token': rocketChat.authToken,
    //     	'X-User-Id': rocketChat.userId,
    //     	'Content-Type': 'multipart/form-data'
    //     },
    //     form: {
    //     	rooms:[{
    //     		name: 'room9',
    //     		members: ['dvora@linnovate.net','dvora@linnovate.net']
    //     	}]
    //     }
    // };

    // update channel
    // var objReq = {
    //     uri: rocketChat.uri + '/api/bulk/updateRoomName',
    //     method: 'PUT',
    //     headers: {
    //     	'X-Auth-Token': rocketChat.authToken,
    //     	'X-User-Id': rocketChat.userId,
    //     	'Content-Type': 'multipart/form-data'
    //     },
    //     form: {
    //     	rooms:[{
    //     		id: 'AaABxBJ6n9Q8xAykg',
    //     		name: 'room6666'
    //     	}]
    //     }
    // };

    var objReq = {
        uri: rocketChat.uri + options.cmd,
        method: options.method,
        headers: {}
    };

    if (options.form) {
        objReq.form = options.form;
        objReq.headers['X-Auth-Token'] = rocketChat.authToken;
        objReq.headers['X-User-Id'] = rocketChat.userId;
        //objReq.headers['Content-Type'] = 'multipart/form-data';
        // Made By OHAD
        objReq.headers['Content-Type'] = 'application/json';
    }

    request(objReq, function(error, response, body) {
        console.log('====================================error============================================')
        console.log(error)
        console.log('====================================body============================================')
        console.log(body)
        var res = JSON.parse(body);
        if (!error && response.body.length && response.statusCode < 300) {
            return callback(res['ids'] ? {id: res['ids'][0]['rid']} : res, response.statusCode);
        }
        callback(error ? error : body, response ? response.statusCode : 500);
    });
}