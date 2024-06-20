const express = require('express')
const userSchema = require('../model/userSchema')
const loginControl=require('../controller/usercontroller/loginControl')
const userHomeControl=require('../controller/usercontroller/userHomeControl')
const {checkUserSession,checkUserSessionBlocked,checkUserLogin}=require('../middleware/userSession')
const user = express.Router()

user.get('/login',checkUserLogin, loginControl.loginRender)

user.post('/login',checkUserLogin, loginControl.loginPost)

user.get('/register',checkUserLogin, loginControl.registerRender)

user.post('/register',checkUserLogin, loginControl.registerPost)

user.get('/home',checkUserSessionBlocked, userHomeControl.homeRender)

user.get('/auth/google',loginControl.googleRender)

user.get('/auth/google/callback',loginControl.googleCallback);

user.get('/logout', loginControl.logout)


module.exports = user

