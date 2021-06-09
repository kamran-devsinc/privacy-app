require('dotenv').config()
const express = require('express')
const router = require('./routes');
const applyMiddlewares = require('./middlewares');
const setupDatabase = require('./config/database');

const app = express()
const SERVER_PORT = process.env.SERVER_PORT || 3000;

setupDatabase();
applyMiddlewares(app);

app.use('/', router);

app.listen({ port: SERVER_PORT }, () => {
  console.log(`app is running on port ${SERVER_PORT}`);
});
