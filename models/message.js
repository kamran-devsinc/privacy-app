const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption')

const Message = new mongoose.Schema({
  text: { type: String, required: true },
  sender: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true }
  },
  receiver: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true }
  },
  key: { type: String, required: true }
}, {
  toJSON: {
    transform(_docs, _ret) {
      _ret.text = decrypt(_ret.text, _ret.key)
      delete _ret.key
      delete _ret.__v
    },
  },
});

Message.pre('save', async function(next) {
  try {
    const { key, encryptedText } = encrypt(this.text);
    this.text = encryptedText
    this.key = key

    next();
  } catch(err) {
    next(err);
  }
});


module.exports = mongoose.model('Message', Message);
