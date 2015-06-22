
exports.checkAndHandleError = function(err, res, defaultMessage) {
	if (err) {
		res.status(500).send(defaultMessage || err.errors || err.message || 'Oops...');
	}
}