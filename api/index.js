const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();
const { updates } = require('./controllers');

module.exports = router;

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))


router.get('/', (req, res, next) => {
  res.send('OK')
})

router.get('/updates', updates.getUpdates)
