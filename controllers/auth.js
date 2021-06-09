const passport = require('passport');
const { generateAuthToken } = require('../middlewares/auth')

const createUserSession = (req, res, user) => {
  req.login(user, { session: false }, (err) => {
    if (err) return res.status(500).json({message: err.message || 'Internal Server Error'});

    try {
      const authToken = generateAuthToken(user.email.value);

      return res.status(200).json({ user, token: authToken });
    } catch(err) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
};

const registerUser = async (req, res) => {
  return passport.authenticate('signup', { session: false }, (err, user) => {
    if(!user) return res.status(400).json({ message: (err && err.message) || 'Bad request' });

    return createUserSession(req, res, user);
  })(req, res);
};

const loginUser = async (req, res) => {
  passport.authenticate('login', { session: false }, (err, user) => {
    if(!user) return res.status(400).json({ message: (err && err.message) || 'Bad request' });

    return createUserSession(req, res, user);
  })(req, res);
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = {
  loginUser,
  getCurrentUser,
  registerUser,
}
