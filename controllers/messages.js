const User = require('../models/user');
const Message = require('../models/message');

const createMessage = async (req, res) => {
  try {
    const { user, body: { message: text, receiverId } } = req

    if (user._id === receiverId) return res.status(400).json({ messsage: 'you cannot send message to yourself' })

    const receiver = await User.findById(receiverId);

    if (!receiver) return res.status(404).json({ message: 'message receiver does not exist' })

    const message = await Message.create({
      text,
      sender: {
        id: user._id,
        name: user.name,
      },
      receiver: {
        id: receiver._id,
        name: receiver.name,
      },
      key: text,
    })

    return res.status(200).json({ message })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const getChat = async (req, res) => {
  try {
    const { user, params: { userId } } = req

    const chat = await Message.find({
      $or: [{ 'sender.id': user._id, 'receiver.id': userId }],
      $or: [{ 'sender.id': userId, 'receiver.id': user._id }],
    })

    return res.status(200).json({ chat })
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = {
  createMessage,
  getChat,
}
