const express = require('express')
const admin = express.Router()
const adminSession = require('../middleware/adminSession')
const loginControl = require('../controller/admincontroller/loginControl')
const dashboardControl = require('../controller/admincontroller/dashboardControl')
const categoryControl = require('../controller/admincontroller/categoryControl')
const productControl = require('../controller/admincontroller/productControl')//named export, above are default
const userControl = require('../controller/admincontroller/userControl')
const upload = require('../middleware/multer')


admin.get('/', loginControl.admin)
admin.get('/login', loginControl.loginRender)
admin.post('/login', loginControl.loginPost)

//dashboard
admin.get('/dashboard', adminSession, dashboardControl.dashboardRender)

//category
admin.get('/category', adminSession, categoryControl.categoryRender)
admin.post('/add-category', adminSession, categoryControl.addCategoryPost)
admin.delete('/delete-category/:categoryID', adminSession, categoryControl.deleteCategory)
admin.put('/block-category/:categoryID', adminSession, categoryControl.blockCategory)
admin.put('/unblock-category/:categoryID', adminSession, categoryControl.unblockCategory)
admin.post('/edit-category/:categoryID', adminSession, categoryControl.editCategory)

// products
admin.get('/products', adminSession, productControl.productRender)
admin.get('/addProduct', adminSession, productControl.addProductRender)
admin.post('/addProduct', upload.array('product_image', 4), adminSession, productControl.addProductPost)
admin.get('/edit-product/:productID', adminSession, productControl.editProductRender)
admin.post('/edit-product/:productID', adminSession, productControl.editProduct)
admin.delete('/delete-product/:productID', adminSession, productControl.deleteProduct)
admin.put('/block-product/:productID', adminSession, productControl.blockProduct)
admin.put('/unblock-product/:productID', adminSession, productControl.unblockProduct)
admin.get('/delete-single-image/:index/:productID', adminSession, productControl.deleteSingleImage)
// admin.post('/save-cropped-image',adminSession, upload.single('croppedImage'),productControl.saveCroppedImage)
admin.post('/save-cropped-image', adminSession, upload.single('croppedImage'), productControl.saveCroppedImage)



//customers 
admin.get('/customers', adminSession, userControl.userRender);
admin.put('/block-user/:userID', adminSession, userControl.blockUser);
admin.put('/unblock-user/:userID', adminSession, userControl.unblockUser);



admin.get('/logout', loginControl.logout)




module.exports = admin