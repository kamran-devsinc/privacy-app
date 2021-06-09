const User = require('../models/user');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) return res.status(404).json({ message: 'user not found' })

    return res.status(200).json({ user })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const sendConnectionRequest = async (req, res) => {
  try {
    const { user, params: { requestedUserId } } = req;

    if (user._id === requestedUserId) return res.status(400).status({ message: 'you cannot send request to yourself' })

    const requestedUser = await User.findById(requestedUserId)

    if (!requestedUser) return res.status(404).json({ message: 'requested user not found' });

    const user1Update = await User.findOneAndUpdate({ _id: user._id }, { $push: { 'connections.value': { userId: requestedUserId, status: User.CONNECTION_STATUSES.requestSent } } })
    const user2Update = await User.findOneAndUpdate({ _id: requestedUserId }, { $push: { 'connections.value': { userId: user._id, status: User.CONNECTION_STATUSES.requestReceived } } })

    return res.status(200).json({ success: true, user1Update, user2Update })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const acceptConnectionRequest = async (req, res) => {
  try {
    const { user, params: { requestedUserId } } = req;

    const requestedUser = await User.findById(requestedUserId)

    if (!requestedUser) return res.status(404).json({ message: 'requested user not found' });

    await User.findOneAndUpdate({ _id: user._id, 'connections.value.userId': requestedUserId, 'connections.value.status': User.CONNECTION_STATUSES.requestReceived }, { 'connections.value.$.status': User.CONNECTION_STATUSES.connected })
    await User.findOneAndUpdate({ _id: requestedUserId, 'connections.value.userId': user._id, 'connections.value.status': User.CONNECTION_STATUSES.requestSent }, { 'connections.value.$.status': User.CONNECTION_STATUSES.connected })

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const declineConnection = async (req, res) => {
  try {
    const { user, params: { requestedUserId } } = req;

    const requestedUser = await User.findById(requestedUserId)

    if (!requestedUser) return res.status(404).json({ message: 'requested user not found' });

    await User.findOneAndUpdate({ _id: user._id, 'connections.value.userId': requestedUserId}, { $pull: { 'connections.value': { userId: requestedUserId } } })
    await User.findOneAndUpdate({ _id: requestedUserId, 'connections.value.userId': user._id}, { $pull: { 'connections.value': { userId: user._id} } })

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const getConnectionsOfStatus = async (req, res) => {
  try {
    const { user, params: { connectionStatus } } = req;

    if (!Object.values(User.CONNECTION_STATUSES).includes(connectionStatus)) return res.status(400).json({ message: 'invalid connection status' })

    const userWithFilteredConnections = await User.findOne({ _id: user._id, 'connections.value.status': connectionStatus})

    return res.status(200).json({ connections: userWithFilteredConnections?.connections?.value ?? [] })
  } catch (err) {
    console.log({ err })
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  getUserProfile,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnection,
  getConnectionsOfStatus,
}