const express = require('express')
const admin = express.Router()
const adminSession = require('../middleware/adminSession')
const loginController = require('../controller/admincontroller/loginController')
const dashboardController = require('../controller/admincontroller/dashboardController')
const categoryController = require('../controller/admincontroller/categoryController')
const productController = require('../controller/admincontroller/productController')
const userController = require('../controller/admincontroller/userController')
const orderController = require('../controller/admincontroller/orderController')
const couponController = require('../controller/admincontroller/couponController')
const offerController = require('../controller/admincontroller/offerController')
const upload = require('../middleware/multer')
const testController=require('../controller/admincontroller/testController')

//admin login 
admin.get('/', loginController.admin)
admin.get('/login', loginController.loginRender)
admin.post('/login', loginController.loginPost)

//dashboard
admin.get('/dashboard', adminSession, dashboardController.dashboardRender)
admin.get('/sales', adminSession, dashboardController.salesRender)
admin.get('/custom-sales-report', adminSession, dashboardController.customSalesReportGet)
admin.post('/custom-sales-report', adminSession, dashboardController.customSalesReport)
admin.post('//admin/pdf-report', adminSession, dashboardController.downloadPdfReport)
admin.get('/trending', adminSession, dashboardController.trendingProducts)

//customers 
admin.get('/customers', adminSession, userController.userRender);
admin.put('/block-user/:userID', adminSession, userController.blockUser);
admin.put('/unblock-user/:userID', adminSession, userController.unblockUser);

//category
admin.get('/category', adminSession, categoryController.categoryRender)
admin.post('/add-category', adminSession, categoryController.addCategoryPost)
admin.delete('/delete-category/:categoryID', adminSession, categoryController.deleteCategory)
admin.put('/block-category/:categoryID', adminSession, categoryController.blockCategory)
admin.put('/unblock-category/:categoryID', adminSession, categoryController.unblockCategory)
admin.post('/edit-category/:categoryID', adminSession, categoryController.editCategory)

// products
admin.get('/products', adminSession, productController.productRender)
admin.get('/products/addProduct', adminSession, productController.addProductRender)
admin.post('/products/addProduct', upload.array('product_image', 4), adminSession, productController.addProductPost)
admin.delete('/delete-product/:productID', adminSession, productController.deleteProduct)
admin.put('/block-product/:productID', adminSession, productController.blockProduct)
admin.put('/unblock-product/:productID', adminSession, productController.unblockProduct)
//edit product
admin.get('/edit-product/:productId',adminSession, productController.getEditProduct);
admin.post('/edit-product/:id',adminSession,upload.array("productImage", 4),productController.editProductPost)

//orders
admin.get('/orders', adminSession, orderController.orderList)
admin.get('/edit-order/:orderID', adminSession, orderController.editOrder)
admin.post('/edit-order/:orderID', adminSession, orderController.editOrderPost)
admin.put('/approve-return/:orderID', adminSession, orderController.approveReturn)
admin.post('/reject-return/:orderID', adminSession, orderController.rejectReturn)


//coupons
admin.get('/coupons',adminSession, couponController.coupons)
admin.get('/coupons/add-coupons',adminSession, couponController.addCouponsGet)
admin.post('/coupons/add-coupons',adminSession, couponController.addCouponsPost)
admin.delete('/delete-coupon/:couponID',adminSession, couponController.deleteCoupon)
admin.put('/block-coupon/:couponID',adminSession, couponController.blockCoupon)
admin.put('/unblock-coupon/:couponID',adminSession, couponController.unblockCoupon)
admin.get('/edit-coupon/:couponID',adminSession, couponController.editCouponGet)
admin.post('/edit-coupon/:couponID',adminSession, couponController.editCoupon)

//offers
admin.get('/offers',adminSession, offerController.offers)
admin.get('/offers/add-offers',adminSession, offerController.addOffersGet)
admin.post('/offers/add-offers',adminSession, offerController.addOffersPost)
admin.delete('/delete-offer/:id',adminSession, offerController.deleteOffer)
// admin.put('/block-offer/:offerID',adminSession, offerController.blockOffer)
// admin.put('/unblock-offer/:offerID',adminSession, offerController.unblockOffer)
admin.get('/edit-offer/:id',adminSession, offerController.editOfferGet)
admin.post('/edit-offer/:id',adminSession, offerController.editOffer)






//test before running
admin.get('/test-run',testController.testRun)
//logout admin
admin.get('/logout', loginController.logout)




module.exports = admin