const express = require('express')
const loginControl = require('../controller/usercontroller/loginControl')
const userHomeControl = require('../controller/usercontroller/userHomeControl')
const { checkUserSession, checkUserSessionBlocked, checkUserLogin } = require('../middleware/userSession')
const productController = require('../controller/usercontroller/productControll')
const cartControl = require('../controller/usercontroller/cartControl')
const user = express.Router()

//login
user.get('/login', checkUserLogin, loginControl.loginRender)
user.post('/login', checkUserLogin, loginControl.loginPost)
user.get('/register', checkUserLogin, loginControl.registerRender)
user.post('/register', checkUserLogin, loginControl.registerPost)

//google auth
user.get('/auth/google', loginControl.googleRender)
user.get('/auth/google/callback', loginControl.googleCallback);

//otp 

user.get('/otp', checkUserLogin, loginControl.otpRender)
user.get('/verification', checkUserLogin, loginControl.verificationRender)
user.get('/confirmPassword', checkUserLogin, loginControl.confirmPasswordRender)



// home route
user.get('/home', checkUserSessionBlocked, userHomeControl.homeRender)

//profile 
user.get('/profile', checkUserSession, userHomeControl.profileRender)
user.post('/address', checkUserSession, userHomeControl.editProfile)

//address
user.post('/add-address', checkUserSession, userHomeControl.addAddress)
user.post('/edit-address/:index', checkUserSession, userHomeControl.editAddress)
user.delete('/delete-address/:index', checkUserSession, userHomeControl.deleteAddress)


//cart
user.get('/cart', checkUserSession, cartControl.viewCart)
user.post('/addToCart/:productID', checkUserSession, cartControl.addToCart)
user.delete('/delete-cart-item/:productID',checkUserSession,cartControl.deleteFromCart)
user.put('/increase-quantity/:productID', checkUserSession,cartControl.increaseQuantity)
user.put('/decrease-quantity/:productID',checkUserSession,cartControl.decreaseQuantity)


//security or password changing
user.get('/security', checkUserSession, userHomeControl.security)
user.post('/newSecurity',checkUserSession,userHomeControl.newSecurity)

// view product
user.get('/product-view/:productID', checkUserSessionBlocked, productController.viewProductRender)

user.get('/logout', loginControl.logout)


module.exports = user

