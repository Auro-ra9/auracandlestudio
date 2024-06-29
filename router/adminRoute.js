const express = require('express')
const admin = express.Router()
const adminSession = require('../middleware/adminSession')
const loginController = require('../controller/admincontroller/loginController')
const dashboardController = require('../controller/admincontroller/dashboardController')
const categoryController = require('../controller/admincontroller/categoryController')
const productController = require('../controller/admincontroller/productController')
const userController = require('../controller/admincontroller/userController')
const upload = require('../middleware/multer')

admin.get('/', loginController.admin)
admin.get('/login', loginController.loginRender)
admin.post('/login', loginController.loginPost)

//dashboard
admin.get('/dashboard', adminSession, dashboardController.dashboardRender)

//category
admin.get('/category', adminSession, categoryController.categoryRender)
admin.post('/add-category', adminSession, categoryController.addCategoryPost)
admin.delete('/delete-category/:categoryID', adminSession, categoryController.deleteCategory)
admin.put('/block-category/:categoryID', adminSession, categoryController.blockCategory)
admin.put('/unblock-category/:categoryID', adminSession, categoryController.unblockCategory)
admin.post('/edit-category/:categoryID', adminSession, categoryController.editCategory)

// products
admin.get('/products', adminSession, productController.productRender)
admin.get('/addProduct', adminSession, productController.addProductRender)
admin.post('/addProduct', upload.array('product_image', 4), adminSession, productController.addProductPost)
admin.delete('/delete-product/:productID', adminSession, productController.deleteProduct)
admin.put('/block-product/:productID', adminSession, productController.blockProduct)
admin.put('/unblock-product/:productID', adminSession, productController.unblockProduct)

//edit product
admin.get('/edit-product/:productID', adminSession, productController.editProductRender)
admin.post('/edit-product/:productID', upload.array('product_image', 4), adminSession, productController.editProduct)
// admin.post('/save-cropped-image', adminSession, upload.single('croppedImage'), productController.saveCroppedImage)
admin.get('/deleteSingleImage/:index/:productID', adminSession, productController.deleteSingleImage);




//customers 
admin.get('/customers', adminSession, userController.userRender);
admin.put('/block-user/:userID', adminSession, userController.blockUser);
admin.put('/unblock-user/:userID', adminSession, userController.unblockUser);



admin.get('/logout', loginController.logout)




module.exports = admin