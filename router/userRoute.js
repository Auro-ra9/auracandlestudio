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
user.post('/otp', checkUserLogin, loginController.otpPost)
user.post('/resend-otp', checkUserLogin, loginController.resendOTP)
user.get('/verification', checkUserLogin, loginController.verificationRender)
user.get('/confirmPassword', checkUserLogin, loginController.confirmPasswordRender)
user.get('/register-confirmed',checkUserSessionBlocked,loginController.registerConfirmed)




// home route
user.get('/home', checkUserSessionBlocked, userHomeController.homeRender)

// view product
user.get('/product-view/:productID', checkUserSessionBlocked, productController.viewProductRender)

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
user.get('/cart', checkUserSession, cartController.viewCart)
user.post('/addToCart/:productID', checkUserSession, cartController.addToCart)
user.delete('/delete-cart-item/:productID', checkUserSession, cartController.deleteFromCart)
user.put('/increase-quantity/:productID', checkUserSession, cartController.increaseQuantity)
user.put('/decrease-quantity/:productID', checkUserSession, cartController.decreaseQuantity)

// checkout 
user.get('/checkout', checkUserSession, checkoutController.checkoutRender)
user.post('/add-address-checkout', checkUserSession, checkoutController.addAddress)
user.post('/edit-address-checkout/:index', checkUserSession, checkoutController.editAddress)
user.delete('/delete-address/:index', checkUserSession, checkoutController.deleteAddress)
user.post('/checkout-submit',checkUserSession,checkoutController.postOrderPlaced)
user.get('/order-confirmed',checkUserSession,checkoutController.orderConfirmed)

//orders
user.get('/orders',checkUserSession,orderController.getOrders)
user.post('/cancel-order/:orderid', checkUserSession,orderController.cancelOrder)
user.get('/cancelled-orders',checkUserSession,orderController.getCancelledOrders)






user.get('/logout', loginController.logout)


module.exports = user

