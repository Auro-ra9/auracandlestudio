const categorySchema = require('../../model/categorySchema')
const productSchema = require('../../model/productSchema')
const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");

const fs = require('fs');


// Multer configuration for file upload
// const upload = multer({
//     limits: {
//         fileSize: 10 * 1024 * 1024, // 10MB limit per file
//     },
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith("image/")) {
//             cb(null, true);
//         } else {
//             cb(new Error("Only images are allowed"));
//         }
//     },
// });

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

const editProductRender = async (req, res) => {
    try {
        const productID = req.params.productID;
        const productDetails = await productSchema.findById(productID).populate('category');
        const categories = await categorySchema.find({ isBlocked: false });

        if (!productDetails) {
            req.flash("errorMessage", "Product not found.");
            return res.redirect('/admin/products');
        }

        res.render('admin/editProduct', {
            title: "Edit Product",
            alertMessage: req.flash('errorMessage'),
            productDetails,
            categories
        });
    } catch (err) {
        console.error("Error on rendering edit product page:", err);
        req.flash("errorMessage", "An error occurred while rendering the edit product page.");
        res.redirect('/admin/products');
    }
};

const editProduct = async (req, res) => {
    try {
        const productID = req.params.productID;
        const updatedData = {
            productName: req.body.product_name,
            productPrice: req.body.product_price,
            category: req.body.product_categorie,
            productQuantity: req.body.available_quantity,
            brand: req.body.available_brand,
            productDescription: req.body.product_description,
            discount: req.body.percentage_discount
        };

        // Handle image updates
        const product = await productSchema.findById(productID);
        let images = [...product.image]; // Get existing images

        // Remove deleted images
        const keptImages = req.body.keptImages ? req.body.keptImages.split(',') : [];
        images = images.filter(img => keptImages.includes(img));

        // Add new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            images = [...images, ...newImages];
        }

        updatedData.image = images;

        const updatedProduct = await productSchema.findByIdAndUpdate(productID, updatedData, { new: true });

        if (updatedProduct) {
            req.flash('successMessage', 'Product updated successfully');
            return res.redirect('/admin/products');
        } else {
            req.flash('errorMessage', 'Failed to update product');
            return res.redirect(`/admin/edit-product/${productID}`);
        }
    } catch (err) {
        console.error(`Error on edit product post: ${err}`);
        req.flash('errorMessage', 'An error occurred while updating the product');
        res.redirect(`/admin/edit-product/${req.params.productID}`);
    }
};

const deleteSingleImage = async (req, res) => {
    try {
        const { index, productID } = req.params;
        const product = await productSchema.findById(productID);

        if (product && product.image && product.image[index]) {
            const deletedImage = product.image.splice(index, 1)[0];
            await product.save();

            try {
                fs.unlinkSync(path.join(__dirname, '..', '..', deletedImage));
            } catch (err) {
                console.error("Error deleting image file:", err);
            }
        }

        res.redirect(`/admin/edit-product/${productID}`);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occurred during deleting single image of the product");
    }
}



module.exports = {
    productRender,
    addProductRender,
    addProductPost,
    deleteProduct,
    blockProduct,
    unblockProduct,
    editProductRender,
    editProduct,
    deleteSingleImage,


}

