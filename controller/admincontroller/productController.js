const categorySchema = require('../../model/categorySchema')
const productSchema = require('../../model/productSchema')
const express = require('express');
const path = require("path");
const fs = require('fs');


const productRender = async (req, res) => {
    try {

        const products = await productSchema.find().sort({ createdAt: -1 }).populate('category')
        res.render('admin/product', {
            title: 'product',
            alertMessage: req.flash('errorMessage'),
            products,
        })

    } catch (err) {
        console.log(`Error on dashboard render: ${err}`);
    }
}

const addProductRender = async (req, res) => {
    try {
        // get all category details
        const category = await categorySchema.find({ isBlocked: false })

        res.render('admin/addProduct', {
            title: 'Add product',
            alertMessage: req.flash('errorMessage'),
            category
        })

    } catch (error) {
        console.log(`Error in addproduct render ${error}`);
    }
}

//Add products 

const addProductPost = async (req, res) => {
    try {
        let productBody = req.body.product_name.trim()
        let actualProduct = productBody
        let actualPrice = req.body.product_price
        let actualBrand = req.body.available_brand.trim()
        let actualCategory = req.body.product_categorie.trim()
        let actualQuantity = req.body.available_quantity
        let actualdescription = req.body.product_description.trim()
        let actualDiscount = req.body.percentage_discount

        const imageArray = []
        console.log(req.files);
        req.files.forEach((img) => {
            imageArray.push(img.path)
        })


        //checkin the fields
        if (!actualProduct && !actualPrice && !actualBrand && !actualCategory && !actualQuantity && !actualdescription && !actualDiscount) {
            req.flash('errorMessage', 'Product not found')
            return res.redirect('/admin/products')
        }

        //already exsit or not
        const productDetails = await productSchema.findOne({ productName: actualProduct, productPrice: actualPrice, band: actualBrand })
        if (productDetails) {
            req.flash('errorMessage', 'Product already exists')
            return res.redirect('/admin/products')
        }

        //saving if it is new

        const newProduct = new productSchema({
            productName: actualProduct,
            productPrice: actualPrice,
            brand: actualBrand,
            category: actualCategory,
            productQuantity: actualQuantity,
            productDescription: actualdescription,
            discount: actualDiscount,
            image: imageArray
        })


        await newProduct.save()
        req.flash('errorMessage', 'Product added successfully')
        res.redirect('/admin/products')


    } catch (error) {
        console.log(`Error on add product post ${error}`);
    }
}

//delete products
const deleteProduct = async (req, res) => {
    try {

        const productID = req.params.productID

        if (!productID) {
            return res.status(404).json({ message: "Product id not found" })
        }

        const deletedProduct = await productSchema.findByIdAndDelete(productID)

        if (deletedProduct) {
            return res.status(200).json({ message: "Product deleted" })
        }
    } catch (err) {
        console.log("Error on deleting the Product", err);


    }
}

//block products
const blockProduct = async (req, res) => {
    try {

        const productID = req.params.productID

        if (!productID) {
            return res.status(404).json({ message: "Product id not found" })
        }

        const blockProduct = await productSchema.findByIdAndUpdate(productID, { isAvailable: false })

        if (blockProduct) {
            return res.status(200).json({ message: "Product blocked" })
        }

    } catch (err) {
        console.log("Error on blocking the Product", err);
    }
}

//unblock products
const unblockProduct = async (req, res) => {
    try {

        const productID = req.params.productID

        if (!productID) {
            return res.status(404).json({ message: "Product id not found" })
        }

        const unblockedProduct = await productSchema.findByIdAndUpdate(productID, { isAvailable: true })

        if (unblockedProduct) {
            return res.status(200).json({ message: "product unblocked" })
        }

    } catch (err) {
        console.log("Error on unblocking the product", err);
    }
}

const getEditProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productSchema.findById(productId).populate('category').exec();

        // Assuming you have categories stored in a Category model and retrieved via mongoose
        const category = await categorySchema.find().exec();

        res.render('admin/editProduct', {
            title: 'Edit product',
            alertMessage: req.flash('errorMessage'),
            product, 
            category
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving product');
    }
};

const postEditProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { 
            product_name, 
            product_price, 
            product_categorie, 
            available_quantity, 
            available_brand, 
            product_description, 
            percentage_discount,
            deletedImages 
        } = req.body;

        // Prepare updated product fields
        const updatedFields = {
            productName: product_name.trim(),
            productPrice: product_price,
            category: product_categorie.trim(),
            productQuantity: available_quantity,
            brand: available_brand.trim(),
            productDescription: product_description.trim(),
            discount: percentage_discount,
        };

        // Update product in database
        const updatedProduct = await productSchema.findById(productId);

        if (!updatedProduct) {
            req.flash('errorMessage', 'Product not found');
            return res.redirect('/admin/products');
        }

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const imageArray = req.files.map(file => file.path);
            updatedProduct.image = updatedProduct.image.concat(imageArray);
        }

        // Handle image deletions
        if (deletedImages) {
            const imagesToDelete = JSON.parse(deletedImages);
            imagesToDelete.forEach((imagePath) => {
                const fullPath = path.join(__dirname, '..', '..', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
            updatedProduct.image = updatedProduct.image.filter(img => !imagesToDelete.includes(img));
        }

        // Update other fields
        Object.assign(updatedProduct, updatedFields);

        await updatedProduct.save();

        req.flash('errorMessage', 'Product updated successfully');
        res.redirect('/admin/products');
    } catch (err) {
        console.log('Error updating product:', err);
        req.flash('errorMessage', 'Failed to update product');
        res.redirect(`/admin/edit-product/${req.params.productId}`);
    }
};



module.exports = {
    productRender,
    addProductRender,
    addProductPost,
    deleteProduct,
    blockProduct,
    unblockProduct,
    getEditProduct,
    postEditProduct,


}

