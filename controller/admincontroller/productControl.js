const categorySchema = require('../../model/categorySchema')
const productSchema= require('../../model/productSchema')

const productRender = async (req, res) => {
    try {

        const products=await productSchema.find().sort({createdAt:-1}).populate('category')
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

        const imageArray=[]
        console.log(req.files);
        req.files.forEach((img)=>{
            imageArray.push(img.path)
        })
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
            discount:actualDiscount,
            image:imageArray
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


// Render edit product page
const editProductRender = async (req, res) => {
    try {
        const productID = req.params.productID;

        if (!productID) {
            req.flash("errorMessage", "Product ID not provided.");
            return res.redirect('/admin/products');
        }

        const productDetails = await productSchema.findById(productID).populate('category');

        if (!productDetails) {
            req.flash("errorMessage", "Product not found.");
            return res.redirect('/admin/products');
        }

        res.render('admin/editProduct', { title: "Edit Product", alertMessage: req.flash('errorMessage'), productDetails });
    } catch (err) {
        console.error("Error on rendering edit product page:", err);
        req.flash("errorMessage", "An error occurred while rendering the edit product page.");
        res.redirect('/admin/products');
    }
};

// Handle edit product form submission
const editProduct = async (req, res) => {
    try {
        const productID = req.params.productID;
        const {
            'edit-product_name': productName,
            'edit-product_price': productPrice,
            'product_categorie': category,
            'edit-available_quantity': quantity,
            'edit-available_brand': brand,
            'product_description': description,
            'edit-percentage_discount': discount
        } = req.body;

        // Check if required fields are missing
        if (!productName || !productPrice || !category || !quantity || !brand || !description || !discount) {
            req.flash('errorMessage', 'All fields are required.');
            return res.redirect(`/admin/edit-product/${productID}`);
        }

        // Update product details
        const updatedProduct = await productSchema.findByIdAndUpdate(productID, {
            productName,
            productPrice,
            category,
            productQuantity: quantity,
            brand,
            productDescription: description,
            discount
        }, { new: true });

        if (updatedProduct) {
            req.flash('successMessage', 'Product details updated successfully.');
            return res.redirect('/admin/products');
        } else {
            req.flash('errorMessage', 'Failed to update product details.');
            return res.redirect(`/admin/edit-product/${productID}`);
        }
    } catch (err) {
        console.error(`Error on edit product post: ${err}`);
        req.flash('errorMessage', 'An error occurred while updating the product.');
        res.redirect(`/admin/edit-product/${req.params.productID}`);
    }
};


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