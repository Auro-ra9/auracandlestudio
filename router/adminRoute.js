const express=require('express')
const admin=express.Router()
const adminSession=require('../middleware/adminSession')
const loginControl=require('../controller/admincontroller/loginControl')
const dashboardControl=require('../controller/admincontroller/dashboardControl')
const categoryControl=require('../controller/admincontroller/categoryControl')
const productControl=require('../controller/admincontroller/productControl')//named export, above are default
const userControl=require('../controller/admincontroller/userControl')


admin.get('/',loginControl.admin)
admin.get('/login',loginControl.loginRender)
admin.post('/login',loginControl.loginPost)

//dashboard
admin.get('/dashboard',adminSession,dashboardControl.dashboardRender)

//category
admin.get('/category',adminSession,categoryControl.categoryRender)
admin.post('/add-category',categoryControl.addCategoryPost)
admin.delete('/delete-category/:categoryID',categoryControl.deleteCategory)
admin.put('/block-category/:categoryID',categoryControl.blockCategory)
admin.put('/unblock-category/:categoryID',categoryControl.unblockCategory)
admin.post('/edit-category/:categoryID',categoryControl.editCategory)

// products
admin.get('/products',adminSession,productControl.productRender)
admin.get('/addProduct', productControl.addProductRender)
admin.post('/addProduct', productControl.addProductPost)
admin.get('/edit-product/:productID', productControl.editProductRender)
admin.post('/edit-product/:productID', productControl.editProduct)
admin.delete('/delete-product/:productID',productControl.deleteProduct)
admin.put('/block-product/:productID', productControl.blockProduct)
admin.put('/unblock-product/:productID', productControl.unblockProduct)

//customers 
admin.get('/customers', adminSession, userControl.userRender);
admin.put('/block-user/:userID', userControl.blockUser);
admin.put('/unblock-user/:userID', userControl.unblockUser);



admin.get('/logout', loginControl.logout)




module.exports=admin