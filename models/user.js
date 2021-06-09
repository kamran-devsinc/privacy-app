const mongoose = require ('mongoose');

const { hash } = require('argon2');

const CONNECTION_STATUSES = { requestSent: 'REQUEST_SENT', requestReceived: 'REQUEST_RECEIVED', connected: 'CONNECTED', requestDeclined: 'REQUESTED_DECLINED' }

const User = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    value: { type: String, required: true, unique: true },
    hidden: { type: Boolean, required: false, default: false },
  },
  password: { type: String, required: true },
  connections: {
    value: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, enum: Object.values(CONNECTION_STATUSES) } }],
    hidden: { type: Boolean, required: false, default: true },
  },
  workExperience: {
    value: { type: String, required: false, default: '' },
    hidden: { type: Boolean, required: false, default: false },
  },
}, {
  toJSON: {
    transform(_docs, _ret) {
      delete _ret.password;
      delete _ret.__v;

      // if (_ret.email.hidden) delete _ret.email;
      // if (_ret.connections.hidden) delete _ret.connections;
      // if (_ret.workExperience.hidden) delete _ret.workExperience;
    },
  },
});

User.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await hash(this.password);

    next();
  } catch(err) {
    next(err);
  }
});


const UserModel = mongoose.model('User', User);
UserModel.CONNECTION_STATUSES = CONNECTION_STATUSES

module.exports = UserModel
