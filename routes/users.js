const express = require('express');
const { getCurrentUser } = require('../controllers/auth')
const {
  getUserProfile,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnection,
  getConnectionsOfStatus,
} = require('../controllers/users')

const router = express.Router();

router.get('/me', getCurrentUser);
router.get('/:id', getUserProfile);
router.put('/send-connection-request/:requestedUserId', sendConnectionRequest)
router.put('/accept-connection-request/:requestedUserId', acceptConnectionRequest)
router.put('/decline-connection-request/:requestedUserId', declineConnection)
router.put('/remove-connection/:requestedUserId', declineConnection)
router.get('/get-connections/:connectionStatus', getConnectionsOfStatus)

module.exports = router;