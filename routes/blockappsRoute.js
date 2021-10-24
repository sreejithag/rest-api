const express = require('express');
const router = express.Router();
const blockappController = require('../controllers/blockappController');

router.post('/add',blockappController.addToBlocklist);
router.get('/list',blockappController.listAll);
router.delete('/remove',blockappController.removeFromBlockList);
module.exports = router;