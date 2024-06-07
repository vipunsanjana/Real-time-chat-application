const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController.js');

router.post('/message', messageController.sendMessage);
router.get('/message/:conversationId', messageController.getMessages);

module.exports = router;
