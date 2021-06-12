const passport = require('passport');
const { sign, verify } = require('jsonwebtoken')
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JWTstrategy, ExtractJwt } = require('passport-jwt');
const argon2 = require('argon2')

const User = require('../models/user');

const { AUTH_SECRET } = process.env;

const generateAuthToken = (payload) => sign(payload, AUTH_SECRET);

const authenticateAuthToken = () => passport.authenticate('jwt', { session: false });

const verifyToken = async (token) => verify(token, AUTH_SECRET);

const SignupStrategy = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false,
}, async (req, email, password, done) => {
  let { name, workExperience } = req.body;

  try {
    let user = await User.findOne({ 'email.value': email });

    if(user) return done({ message: 'Email already in use' }, false);

    user = await User.create({
      name,
      email: { value: email },
      password,
      workExperience: { value: workExperience },
    });

    return done(null, user);
  } catch (err) {
    done(err, false)
  }
});

const LoginStrategy = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
}, (email, password, done) => {
  User.findOne({
    'email.value': email
  }).then((user) => {
    if (!user) {
      return done({ message: 'Invalid email or password!' }, false);
    }

    argon2.verify(user.password, password).then((isVerified) => {
      if (!isVerified) {
        return done({ message: 'Invalid email or password!' }, false);
      }
      return done(null, user);
    });
  }).catch(err => done(err, false));
});

const AuthenticationStrategy = new JWTstrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: AUTH_SECRET,
  passReqToCallback: true,
}, (req, email, done) => {
  User.findOne({ 'email.value': email })
    .then((user) => {
      if (user) {
        done(null, user);
      } else {
        done(null, false, { message: 'User not found!' });
      }
    })
    .catch(err => done(null, false, err));
});

module.exports = {
  generateAuthToken,
  authenticateAuthToken,
  verifyToken,
  SignupStrategy,
  LoginStrategy,
  AuthenticationStrategy,
}
