const express = require('express')
const userSchema = require('../model/userSchema')
const loginControl=require('../controller/usercontroller/loginControl')
const userHomeControl=require('../controller/usercontroller/userHomeControl')
const {checkUserSession,checkUserSessionBlocked,checkUserLogin}=require('../middleware/userSession')
const productController=require('../controller/usercontroller/productControll')
const user = express.Router()

user.get('/login',checkUserLogin, loginControl.loginRender)
user.post('/login',checkUserLogin, loginControl.loginPost)
user.get('/register',checkUserLogin, loginControl.registerRender)
user.post('/register',checkUserLogin, loginControl.registerPost)

//google auth
user.get('/auth/google',loginControl.googleRender)
user.get('/auth/google/callback',loginControl.googleCallback);

//otp 

user.get('/otp',checkUserLogin, loginControl.otpRender)
user.get('/verification',checkUserLogin, loginControl.verificationRender)
user.get('/confirmPassword',checkUserLogin, loginControl.confirmPasswordRender)



// home route
user.get('/home',checkUserSessionBlocked, userHomeControl.homeRender)

// view product
user.get('/product-view/:productID',checkUserSessionBlocked,productController.viewProductRender)

user.get('/logout', loginControl.logout)


module.exports = user

