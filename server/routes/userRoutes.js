const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.get('/users/:userId', userController.getUsers);

module.exports = router;
