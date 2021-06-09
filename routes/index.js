const express = require('express');

const { authenticateAuthToken } = require('../middlewares/auth');

const AuthRoutes = require('./auth');
const UserRoutes = require('./users');
const MessageRoutes = require('./messages');

const router = express.Router();

router.use('/', AuthRoutes);
router.use('/users', authenticateAuthToken(), UserRoutes);
router.use('/messages', authenticateAuthToken(), MessageRoutes);

module.exports = router;
