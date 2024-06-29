const express = require('express')
const loginController = require('../controller/usercontroller/loginController')
const userHomeController = require('../controller/usercontroller/userHomeController')
const { checkUserSession, checkUserSessionBlocked, checkUserLogin } = require('../middleware/userSession')
const productController = require('../controller/usercontroller/productController')
const cartController = require('../controller/usercontroller/cartController') 
const checkoutController = require('../controller/usercontroller/checkoutController') 
const user = express.Router()

//login
user.get('/login', checkUserLogin, loginController.loginRender)
user.post('/login', checkUserLogin, loginController.loginPost)
user.get('/register', checkUserLogin, loginController.registerRender)
user.post('/register', checkUserLogin, loginController.registerPost)

//google auth
user.get('/auth/google', loginController.googleRender)
user.get('/auth/google/callback', loginController.googleCallback);

//otp 

user.get('/otp', checkUserLogin, loginController.otpRender)
user.get('/verification', checkUserLogin, loginController.verificationRender)
user.get('/confirmPassword', checkUserLogin, loginController.confirmPasswordRender)



// home route
user.get('/home', checkUserSessionBlocked, userHomeController.homeRender)

//profile 
user.get('/profile', checkUserSession, userHomeController.profileRender)
user.post('/address', checkUserSession, userHomeController.editProfile)

//address
user.post('/add-address', checkUserSession, userHomeController.addAddress)
user.post('/edit-address/:index', checkUserSession, userHomeController.editAddress)
user.delete('/delete-address/:index', checkUserSession, userHomeController.deleteAddress)


//cart
user.get('/cart', checkUserSessionBlocked, cartController.viewCart)
user.post('/addToCart/:productID', checkUserSessionBlocked, cartController.addToCart)
user.delete('/delete-cart-item/:productID',checkUserSessionBlocked,cartController.deleteFromCart)
user.put('/increase-quantity/:productID', checkUserSessionBlocked,cartController.increaseQuantity)
user.put('/decrease-quantity/:productID',checkUserSessionBlocked,cartController.decreaseQuantity)

//checkout 
//address
user.post('/add-address', checkUserSessionBlocked, checkoutController.addAddress)
user.post('/edit-address/:index', checkUserSessionBlocked, checkoutController.editAddress)
user.delete('/delete-address/:index', checkUserSessionBlocked, checkoutController.deleteAddress)




//security or password changing
user.get('/security', checkUserSession, userHomeController.security)
user.post('/newSecurity',checkUserSession,userHomeController.newSecurity)

// view product
user.get('/product-view/:productID', checkUserSessionBlocked, productController.viewProductRender)

// checkout 
user.get('/checkout',checkUserSession,checkoutController.checkoutRender)

user.get('/logout', loginController.logout)


module.exports = user

