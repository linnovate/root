'use strict';

exports.load = function(swagger, parms) {

  var searchParms = parms.searchableOptions;

  var send = {
    'spec': {
      description: 'send notification to app',
      path: '/api/notifications/:appName/:token/:room/:text',
      method: 'POST',
      summary: 'send notification to app',
      notes: '',
      type: '',
      nickname: 'sendNotification',
      produces: ['application/json'],
      parameters: [{
        name: 'body',
        description: 'Article to create.  User will be inferred by the authenticated user.',
        required: true,
        type: '',
        paramType: 'body',
        allowMultiple: false
      }]
    }
  };

  swagger
    .addPost(send);

};
