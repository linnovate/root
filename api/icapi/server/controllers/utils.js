
exports.checkAndHandleError = function(err, res, defaultMessage) {
	if (err) {
		return res.send(500, defaultMessage || err.errors || err.message || 'Oops...');
	}
}