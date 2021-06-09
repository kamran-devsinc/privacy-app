const express = require('express');
const {
  createMessage,
  getChat,
} = require('../controllers/messages')

const router = express.Router();

router.post('/', createMessage);
router.get('/chats/:userId', getChat);

module.exports = router;
