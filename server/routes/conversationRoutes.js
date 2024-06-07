const express = require('express');
const router = express.Router();
const { createConversation, getConversations } = require('../controllers/coversationController');

router.post('/conversation', createConversation);
router.get('/conversations/:userId', getConversations);

module.exports = router;
