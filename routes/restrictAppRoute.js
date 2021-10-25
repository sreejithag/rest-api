const express = require('express');
const router = express.Router();
const restrictAppController = require('../controllers/restrictAppController');


router.post('/add',restrictAppController.addRestriction);
router.get('/listall',restrictAppController.listAllRestrictions);

module.exports = router;