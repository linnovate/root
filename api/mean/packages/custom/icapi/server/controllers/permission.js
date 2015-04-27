exports.echo = function (req, res, next) {
	console.log('general permissions');
	next();
}

exports.forceLogIn = function(req, res, next) {
	if (!req.user) {
		return res.send(401,'You must be logged in');
	}
	next();
}