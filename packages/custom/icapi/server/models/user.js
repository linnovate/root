var mongoose = require('mongoose');
require('mongoose-schema-extend');

var IcuUserSchema = mongoose.modelSchemas.User.extend({

});

mongoose.model('IcuUser', IcuUserSchema);
