const categorySchema = require('../../model/categorySchema')
const productSchema= require('../../model/productSchema')

const productRender = async (req, res) => {
    try {
        const products=await productSchema.find().populate('category')
        console.log(products);

        res.render('admin/product', {
            title:'product', 
            alertMessage: req.flash('errorMessage'),
            products,
        })
    } catch (err) {
        console.log(`Error on dashboard render: ${err}`);
    }
}

const addProductRender= async (req,res)=>{
    try {
        // get all category details
        const category=await categorySchema.find({isBlocked:false})

        res.render('admin/addProduct', {
            title:'Add product', 
            alertMessage:req.flash('errorMessage'),
            category
        }) 

    } catch (error) {
        console.log(`Error in addproduct render ${error}`);
    }
}

//Add products

const addProductPost= async (req,res)=>{
    try {
        let productBody= req.body.product_name.trim()
        let actualProduct=productBody
        let actualPrice=req.body.product_price
        let actualBrand=req.body.available_brand.trim()
        let actualCategory=req.body.product_categorie.trim()
        let actualQuantity=req.body.available_quantity
        let actualdescription=req.body.product_description.trim()
        let actualDiscount=req.body.percentage_discount
        //check the fields

        if(!actualProduct && !actualPrice && !actualBrand && !actualCategory && !actualQuantity && !actualdescription && !actualDiscount) {
            req.flash('errorMessage', 'Product not found')
            return res.redirect('/admin/products')
        }

        //already exsit or not

        const productDetails=await productSchema.findOne({productName:actualProduct,productPrice:actualPrice,band:actualBrand})
        if(productDetails){
            req.flash('errorMessage', 'Product already exists')
            return res.redirect('/admin/products')
        }

        //saving if it is new

        const newProduct=new productSchema({
            productName:actualProduct,
            productPrice: actualPrice,
            brand:actualBrand,
            category:actualCategory,
            productQuantity:actualQuantity,
            productDescription:actualdescription,
            discount:actualDiscount
        })

        await newProduct.save()
        req.flash('errorMessage', 'Product added successfully')
        res.redirect('/admin/products')


    } catch (error) {
        console.log(`Error on add product post ${error}`);
    }
}

//delete products
const deleteProduct=async(req,res)=>{
    try {

        const productID=req.params.productID

        if(!productID){
            return res.status(404).json({message:"Product id not found"})
        }

        const deletedProduct=await productSchema.findByIdAndDelete(productID)

        if(deletedProduct){
            return res.status(200).json({message:"Product deleted"})
        }
    } catch (err) {
        console.log("Error on deleting the Product",err);


    }
}

//block products
const blockProduct=async(req,res)=>{
    try {

        const productID=req.params.productID

        if(!productID){
            return res.status(404).json({message:"Product id not found"})
        }
        
        const blockProduct=await productSchema.findByIdAndUpdate(productID,{isAvailable:false})
        
        if(blockProduct){
            return res.status(200).json({message:"Product blocked"})
        }
        
    } catch (err) {
        console.log("Error on blocking the Product",err);
    }
}

//unblock products
const unblockProduct=async(req,res)=>{
    try {

        const productID=req.params.productID

        if(!productID){
            return res.status(404).json({message:"Product id not found"})
        }
        
        const unblockedProduct=await productSchema.findByIdAndUpdate(productID,{isAvailable:true})
        
        if(unblockedProduct){
            return res.status(200).json({message:"product unblocked"})
        }
        
    } catch (err) {
        console.log("Error on unblocking the product",err);
    }
}

//showing edit product page

const editProductRender=async (req,res)=>{
    try {
        const productID=req.params.productID;

        if(!productID){
            req.flash("errorMessage","cannot find the product  ID");
            return res.redirect('/admin/products')
        }

        const productDetails=await productSchema.findById(productID).populate('category')

        if(!productDetails){
            req.flash("errorMessage","cannot find the product details");
            return res.redirect('/admin/products')
        }

        res.render('admin/editProduct',{title:"editProduct",alertMessage:req.flash('errorMessage'),productDetails})

    } catch (err) {
        console.log("error on rendering edit product page",err);
    }
}

//allowing edit on product page

const editProduct=async (req,res)=>{
    try {
        let productBody= req.body.product_name.trim()
        let actualProduct=productBody
        let actualPrice=req.body.product_price
        let actualBrand=req.body.available_brand.trim()
        let actualCategory=req.body.product_categorie.trim()
        let actualQuantity=req.body.available_quantity
        let actualdescription=req.body.product_description.trim()
        let actualDiscount=req.body.percentage_discount
        //check the fields

        if(!actualProduct && !actualPrice && !actualBrand && !actualCategory && !actualQuantity && !actualdescription && !actualDiscount) {
            req.flash('errorMessage', 'Product not found')
            return res.redirect('/admin/products')
        }

        //already exist or not

        const productDetails=await productSchema.findOne({productName:actualProduct,productPrice:actualPrice,band:actualBrand})
        if(productDetails){
            req.flash('errorMessage', 'Product already exists')
            return res.redirect('/admin/products')
        }

        //editing and saving the updated data 

        //edit name of the product
        const editedProductName=await productSchema.findByIdAndUpdate(productID,{productName:actualProduct})
        
        if(editedProductName){
            req.flash('errorMessage',"Product name edited")
            return res.redirect('/admin/addProduct')
        }

        //edit price of the product
        const editedProductPrice= await productSchema.findByIdAndUpdate(productID, {productPrice:actualPrice})

        if(editedProductPrice){
            req.flash('errorMessage',"Product price edited")
            return res.redirect('/admin/addProduct')
        }
        //edit brand
        const editedProductBrand= await productSchema.findByIdAndUpdate(productID,{brand:actualBrand})
        
        if(editedProductBrand){
            req.flash('errorMessage',"Product brand edited")
            return res.redirect('/admin/addProduct')
        }

        //edit quantity of the product
        const editedProductQuantity= await productSchema.findByIdAndUpdate(productID,{productQuantity:actualQuantity})
        
        if(editedProductQuantity){
        req.flash('errorMessage',"Product brand edited")
            return res.redirect('/admin/addProduct')
        }
        //edit description
        const editedProductDescription= await productSchema.findByIdAndUpdate(productID,{productDescription:actualdescription})

        if(editedProductDescription){
            req.flash('errorMessage',"Product Description edited")
            return res.redirect('/admin/addProduct')
        }

        //edit discount of the product
        const editedProductDiscount= await productSchema.findByIdAndUpdate(productID,{discout:actualDiscount})

        if(editedProductDiscount){
            req.flash('errorMessage',"Product Discount edited")
            return res.redirect('/admin/addProduct')
        }
        
    } catch (err) {
        console.log(`error on edit product post ${err}`);
    }
}

module.exports={
    productRender,
    addProductRender,
    addProductPost,
    deleteProduct,
    blockProduct,
    unblockProduct,
    editProductRender,
    editProduct
}