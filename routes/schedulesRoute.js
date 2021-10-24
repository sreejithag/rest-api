const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');


//router.get('/:day',);
router.post('/add',scheduleController.addSchedule);
//router.delete('/delete',);
//router.patch('/update',)


module.exports = router;