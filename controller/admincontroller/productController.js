const categorySchema = require('../../model/categorySchema')
const productSchema = require('../../model/productSchema')
const express = require('express');
const path = require("path");
const fs = require('fs');


const productRender = async (req, res) => {
    try {
        // Pagination parameters
        const productsPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * productsPerPage;

        // Counting the total number of product
        const productsCount = await productSchema.countDocuments()

        const products = await productSchema.find().sort({ createdAt: -1 }).populate('category').skip(skip).limit(productsPerPage)
        res.render('admin/product', {
            title: 'product',
            alertMessage: req.flash('errorMessage'),
            products,
            currentPage,
            totalPages: Math.ceil(productsCount / productsPerPage)
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
        // let actualDiscount = req.body.percentage_discount

        const imageArray = []
        req.files.forEach((img) => {
            imageArray.push(img.path)
        })


        //checkin the fields
        if (!actualProduct && !actualPrice && !actualBrand && !actualCategory && !actualQuantity && !actualdescription) {
            req.flash('errorMessage', 'Product not found')
            return res.redirect('/admin/products')
        }

        //already exsit or not
        const productDetails = await productSchema.findOne({ productName: actualProduct, productPrice: actualPrice, brand: actualBrand })
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
            // discount: actualDiscount,
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
        //deleting the product using the order id got from the params
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

        //blocking the order using the order id got from the params
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

        //unblocking the order using the order id got from the params
        const unblockedProduct = await productSchema.findByIdAndUpdate(productID, { isAvailable: true })

        if (unblockedProduct) {
            return res.status(200).json({ message: "product unblocked" })
        }

    } catch (err) {
        console.log("Error on unblocking the product", err);
    }
}

//render edit product page
const getEditProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productSchema.findById(productId).populate('category').exec();
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

//edit product 
const editProductPost = async (req, res) => {
    try {
        const { productPrice, productDescription, productQuantity, productName, productBrand } = req.body


        // get the id of the product
        const productID = req.params.id;

        // Delete images from the backend
        const imagesToDelete = JSON.parse(req.body.deletedImages || '[]');
        // imagesToDelete.forEach(x => fs.unlinkSync(x));

        // Remove deleted images from DB
        if (imagesToDelete.length > 0) {
            await productSchema.findByIdAndUpdate(productID, {
                $pull: { image: { $in: imagesToDelete } }
            });
        }

        // Add new image paths to DB
        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map(file => file.path.replace(/\\/g, '/'));
            await productSchema.findByIdAndUpdate(productID, {
                $push: { image: { $each: imagePaths } }
            });
        }

        // update the product using the values from form
        productSchema.findByIdAndUpdate(productID,
            {
                productName: productName,
                brand: productBrand,
                productPrice: productPrice,
                productDescription: productDescription,
                productQuantity: productQuantity,
                // discount:productDiscount
            })
            .then((elem) => {
                req.flash('errorMessage', 'Product Updated successfully');
                res.redirect('/admin/products')
            }).catch((err) => {
                console.log(`Error while updating the product ${err}`);
                req.flash('errorMessage', 'Product is not updated')
                res.redirect('/admin/products')
            })
    } catch (err) {
        console.log(`Error during updating the product on database ${err}`);
        req.flash('errorMessage', 'Oops the action is not completed')
        res.redirect('/admin/products')
    }

}

module.exports = {
    productRender,
    addProductRender,
    addProductPost,
    deleteProduct,
    blockProduct,
    unblockProduct,
    getEditProduct,
    editProductPost,



}

