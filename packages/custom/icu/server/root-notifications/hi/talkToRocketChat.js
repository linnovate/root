
request = require('request');

exports.talkToRocketChat = function(rocketChat, options, callback) {
    if(rocketChat.active == true){
        var loginRequest = {
            'uri' : rocketChat.uri + "/api/v1/login",
            'strictSSL' : false,
            'method' : "POST",
            'headers' : {"Content-type":"application/json"},
            'form' : {
                "username" : rocketChat.username,
                "password" : rocketChat.password   
            }
        };
        request.post(loginRequest , function(error,response,body){
            var jsonBody = JSON.parse(body);
            var status = jsonBody.status;

            if(status == "error" || error){
                callback(error ? error : body , response ? response.statusCode : 500);
            }
            else{
                var bodyJson = JSON.parse(body);
                var authToken = bodyJson.data.authToken;
                var userId = bodyJSon.data.userId;
                var objReq = {
                    'uri' : rocketChat.uri + options.cmd ,
                    'method' : options.method , 
                    'headers' : {
                        'X-Auth-Token' : authToken,
                        'X-User-Id' : userId,
                        'Content-Type' : 'application/json'
                    } ,
                    'form' : options.form,
                    'strictSSL' : false
                };
                request(objReq , function(error , response , body){
                    if(!error && response.body.length && response.statusCode < 300){
                        var res = JSON.parse(body);
                        return callback(null , res['ids'] ? {id: res['ids'][0]['rid']} : res , response.statusCode);
                    }
                    else{
                        callback(error ? error : body , response ? response.statusCode : 500);
                    }
                });
            }
        });
    }
    else{
        callback(true , null);
    }
}