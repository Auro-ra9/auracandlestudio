const express = require('express')
const loginController = require('../controller/usercontroller/loginController')
const userHomeController = require('../controller/usercontroller/userHomeController')
const { checkUserSession, checkUserSessionBlocked, checkUserLogin } = require('../middleware/userSession')
const productController = require('../controller/usercontroller/productController')
const cartController = require('../controller/usercontroller/cartController')
const checkoutController = require('../controller/usercontroller/checkoutController')
const orderController=require('../controller/usercontroller/orderController')
const wishlistController=require('../controller/usercontroller/wishlistController')
const walletController=require('../controller/usercontroller/walletController')
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
user.get('/register-confirmed',checkUserSessionBlocked,loginController.registerConfirmed)
//password resent with forget methos
user.get('/forgot-password', checkUserLogin, loginController.forgotPasswordRender)
user.post('/forgot-password', checkUserLogin, loginController.forgotPasswordPost)
user.get('/forgot-otp', checkUserLogin, loginController.passwordOtpRender)
user.post('/forgot-otp', checkUserLogin, loginController.passwordOtpPost)
user.post('/password-resend-otp', checkUserLogin, loginController.passwordResendOTP)
user.get('/reset-password', checkUserLogin, loginController.resetPasswordRender)
user.post('/reset-password', checkUserLogin, loginController.resetPasswordPost)



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

//wishlist
user.get('/wishlist', checkUserSession, wishlistController.viewWishlist)
user.post('/addToWishlist/:productID', checkUserSession, wishlistController.addToWishlist)
user.delete('/delete-wishlist-item/:productID', checkUserSession, wishlistController.deleteFromWishlist)


//cart
user.get('/cart', checkUserSession, cartController.viewCart)
user.post('/addToCart/:productID', checkUserSession, cartController.addToCart)
user.delete('/delete-cart-item/:productID', checkUserSession, cartController.deleteFromCart)
user.put('/increase-quantity/:productID', checkUserSession, cartController.increaseQuantity)
user.put('/decrease-quantity/:productID', checkUserSession, cartController.decreaseQuantity)
user.post('/validate-checkout', checkUserSession, cartController.validateCheckout)

// checkout 
user.get('/checkout', checkUserSession, checkoutController.checkoutRender)
user.post('/add-address-checkout', checkUserSession, checkoutController.addAddress)
user.post('/edit-address-checkout/:index', checkUserSession, checkoutController.editAddress)
user.delete('/delete-address/:index', checkUserSession, checkoutController.deleteAddress)
user.post('/checkout-submit',checkUserSession,checkoutController.postOrderPlaced)
user.get('/order-confirmed',checkUserSession,checkoutController.orderConfirmed)
user.post('/get-coupon',checkUserSession,checkoutController.getCoupon)
user.post('/apply-coupon',checkUserSession,checkoutController.applyCoupon)
user.put('/remove-coupon',checkUserSession,checkoutController.removeCoupon)
user.post('/render-razorPay',checkUserSession,checkoutController.renderRazorPay)
user.post('/payment-pending',checkUserSession,checkoutController.pendingRazorPay)
user.get('/order-pending',checkUserSession,checkoutController.paymentFailedMessage)

//orders
user.get('/orders',checkUserSession,orderController.getOrders)
user.get('/track-order/:orderid',checkUserSession,orderController.getTrackOrders)
user.post('/cancel-order/:orderid', checkUserSession,orderController.cancelOrder)
user.get('/cancelled-orders',checkUserSession,orderController.getCancelledOrders)
user.post('/return-request-order/:orderid', checkUserSession,orderController.returnOrder)
user.post('/proceed-payment/:orderid', checkUserSession,orderController.proceedPayment)
user.delete('/discard-order/:orderid', checkUserSession,orderController.discardOrder)
user.post('/get-razorPay', checkUserSession,orderController.getRazorPayForPendingOrder)

user.post('/render-razorPay-pending',checkUserSession,orderController.renderRazorPay)
user.post('/checkout-submit-pending-order',checkUserSession,orderController.postOrderPlaced)
user.post('/invoice/:orderID',checkUserSession,orderController.downloadInvoice)

//wallet
user.get('/wallet',checkUserSession,walletController.walletGet)






user.get('/logout', loginController.logout)


module.exports = user

