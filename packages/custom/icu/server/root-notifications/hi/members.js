var talkToRocketChat = require('./talkToRocketChat')

exports.addMember = function(rocketChat, params, callback) {
	var name = params.member;
	if(name.indexOf('.')!=-1){
		name = name.substring(0,name.lastIndexOf('.')); //RocketChate username is of type "user@domain"
	}
	talkToRocketChat.talkToRocketChat(rocketChat, {
		method: 'POST',
		form: {
			roomId: params.roomId,
			userId: name
		},
		cmd: '/api/v1/groups.invite'
	}, function(error, result) {
		callback(error, result)
	});
}

exports.removeMember = function(rocketChat, params, callback) {
	var name = params.member;
	if(name.indexOf('.')!=-1){
		name = name.substring(0,name.lastIndexOf('.'));
	}
	talkToRocketChat.talkToRocketChat(rocketChat, {
		method: 'POST',
		form: {
			roomId: params.roomId,
			userId: name
		},
		cmd: '/api/v1/groups.kick'
	}, function(error, result) {
		callback(error, result)
	});
}