const express = require('express')
const loginController = require('../controller/usercontroller/loginController')
const userHomeController = require('../controller/usercontroller/userHomeController')
const { checkUserSession, checkUserSessionBlocked, checkUserLogin } = require('../middleware/userSession')
const productController = require('../controller/usercontroller/productController')
const cartController = require('../controller/usercontroller/cartController')
const checkoutController = require('../controller/usercontroller/checkoutController')
const orderController=require('../controller/usercontroller/orderController')
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

// view product
user.get('/product-view/:productID', checkUserSession, productController.viewProductRender)

//profile 
user.get('/profile', checkUserSession, userHomeController.profileRender)
user.post('/address', checkUserSession, userHomeController.editProfile)

//address
user.post('/add-address', checkUserSession, userHomeController.addAddress)
user.post('/edit-address/:index', checkUserSession, userHomeController.editAddress)
user.delete('/delete-address/:index', checkUserSession, userHomeController.deleteAddress)

//security or password changing
user.get('/security', checkUserSession, userHomeController.security)
user.post('/newSecurity', checkUserSession, userHomeController.newSecurity)


//cart
user.get('/cart', checkUserSessionBlocked, cartController.viewCart)
user.post('/addToCart/:productID', checkUserSessionBlocked, cartController.addToCart)
user.delete('/delete-cart-item/:productID', checkUserSessionBlocked, cartController.deleteFromCart)
user.put('/increase-quantity/:productID', checkUserSessionBlocked, cartController.increaseQuantity)
user.put('/decrease-quantity/:productID', checkUserSessionBlocked, cartController.decreaseQuantity)

// checkout 
user.get('/checkout', checkUserSession, checkoutController.checkoutRender)
user.post('/add-address-checkout', checkUserSessionBlocked, checkoutController.addAddress)
user.post('/edit-address-checkout/:index', checkUserSessionBlocked, checkoutController.editAddress)
user.delete('/delete-address/:index', checkUserSessionBlocked, checkoutController.deleteAddress)
user.post('/checkout-submit',checkUserSessionBlocked,checkoutController.postOrderPlaced)
user.get('/order-confirmed',checkUserSession,checkoutController.orderConfirmed)

//orders
user.get('/orders',checkUserSession,orderController.getOrders)






user.get('/logout', loginController.logout)


module.exports = user

