var express = require('express');
var router = express.Router();

const siteVerifier = require('../services/verifier');

//router.get('/:site', siteVerifier.verify);
router.post('/', siteVerifier.verify);

module.exports = router;
