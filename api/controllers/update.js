const { Update } = require('../models');

module.exports = {
  getUpdates
}

function getUpdates(req, res, next) {
  let {
    skip,
    limit,
    entityId
  } = req.query;

  let query = {
    skip,
    limit,
    entityId
  };

  Update.find(query)
    .then(docs => {
      res.send(docs);
    })
    .catch(next)

}
