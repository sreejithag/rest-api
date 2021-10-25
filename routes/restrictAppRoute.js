const express = require('express');
const router = express.Router();
const restrictAppController = require('../controllers/restrictAppController');


router.post('/add',restrictAppController.addRestriction);
router.get('/listall',restrictAppController.listAllRestrictions);
router.get('/list',restrictAppController.listRestrictionForApp);
router.delete('/delete',restrictAppController.deleteRestrictionForapp);
router.patch('/edit',restrictAppController.editRestrictionForApp);
module.exports = router;