const User = require('../models/user');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })

    if (!user) return res.status(404).json({ message: 'user not found' })

    const formattedUser = {
      _id: user._id,
      name: user.name,
      email: !user.email.hidden && user.email || undefined,
      workExperience: !user.workExperience.hidden && user.workExperience || undefined,
      connections: (!user.connections.hidden && user.connections) || undefined,
    }

    if (formattedUser.connections) {
      formattedUser.connections.value = user.connections.value.filter((connection) => connection.status === User.CONNECTION_STATUSES.connected)
    }

    return res.status(200).json({ user: formattedUser })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const  { connections } = req.user
    let userIds = connections.value.map( ({userId}) => userId )
    userIds.push(req.user._id)
    const users = await User.find({ _id: { $nin: userIds }})

    return res.status(200).json({ users })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const updateUser = async (req, res) => {
  try {
    const { user, body } = req;

    let updatedUser = user
    updatedUser.name = body.name || user.name
    if (body.email && body.email.hasOwnProperty('hidden')) {
      updatedUser.email.hidden = body.email.hidden
    }
    if (body.workExperience && body.workExperience.hasOwnProperty('hidden')) {
      updatedUser.workExperience.hidden = body.workExperience.hidden
    }
    if (body.connections && body.connections.hasOwnProperty('hidden')) {
      updatedUser.connections.hidden = body.connections.hidden
    }

    updatedUser = await User.findOneAndUpdate({ _id: user._id }, updatedUser, { new: true })

    return res.status(200).json({ user: updatedUser })
  } catch(err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const sendConnectionRequest = async (req, res) => {
  try {
    const { user, params: { requestedUserId } } = req;

    if (user._id === requestedUserId) return res.status(400).status({ message: 'you cannot send request to yourself' })

    const requestedUser = await User.findById(requestedUserId)

    if (!requestedUser) return res.status(404).json({ message: 'requested user not found' });

    await User.findOneAndUpdate({ _id: user._id }, { $push: { 'connections.value': { userId: requestedUserId, name: requestedUser.name,  status: User.CONNECTION_STATUSES.requestSent } } })
    await User.findOneAndUpdate({ _id: requestedUserId }, { $push: { 'connections.value': { userId: user._id, name: user.name, status: User.CONNECTION_STATUSES.requestReceived } } })

    return res.status(200).json({ success: true })
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

module.exports = {
  getUserProfile,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnection,
  getAllUsers,
  updateUser,
}
