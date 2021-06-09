const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors')

const { SignupStrategy, LoginStrategy, AuthenticationStrategy } = require('./auth');

const applyMiddlewares = (app) => {
  app.use(cors())

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(passport.initialize());

  passport.use('signup', SignupStrategy);
  passport.use('login', LoginStrategy);
  passport.use('jwt', AuthenticationStrategy);
}

module.exports = applyMiddlewares;
