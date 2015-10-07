/**
 * Created by shoshi on 9/2/15.
 */

var mean = require('meanio'),
    config = mean.loadConfig(),
    apiUri = config.api.uri,
    request = require('request');

exports.talkToApi = function(options, callback) {

    var cmd_api = (options.param) ? options.cmd + '/' + options.param : options.cmd;
    var objReq = {
        uri: apiUri + cmd_api,
        method: options.method,
        headers: {},
        data: options.data
    };

    if (options.headers) {
        objReq.headers = {
            connection: options.headers.connection,
            accept: options.headers.accept,
            'user-agent': options.headers['user-agent'],
            authorization: options.headers.authorization,
            'accept-language': options.headers['accept-language'],
            cookie: options.headers.cookie,
            'if-none-match': options.headers['if-none-match']
        };

    }

    if (options.form) {
        objReq.form = options.form;
        objReq.headers['Content-Type'] = 'multipart/form-data';
    }
    if(options.gzip)
        objReq.gzip = true;

    request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length) {
            return callback(JSON.parse(body), response.statusCode);
        }
        callback(error ? error : body, response ? response.statusCode : 500);

    });
}
