const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');


router.get('/:day',scheduleController.getScehdule);
router.post('/add',scheduleController.addSchedule);
//router.delete('/delete',);
router.patch('/update/:day',scheduleController.updateSchedule);


module.exports = router;