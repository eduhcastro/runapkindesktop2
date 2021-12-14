require('dotenv').config()

const { App } = require('./App');

App({
  appId: process.env.APP_ID,
})