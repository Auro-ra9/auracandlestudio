const categorySchema = require('../../model/categorySchema');
const offerSchema = require('../../model/offerSchema');
const productSchema = require('../../model/productSchema');
const mongoose = require('mongoose')


// Fetch and render the offers page
const offers = async (req, res) => {
    try {
        // Pagination parameters
        const offerPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * offerPerPage;
        // Counting the total number of offer
        const offerCount = await offerSchema.countDocuments()


        // Fetching the offer for the current page
        const offers = await offerSchema.find().sort({ createdAt: -1 }).skip(skip).limit(offerPerPage)

        // Render the offers page with pagination
        res.render('admin/offers',
            {
                title: 'offers',
                alertMessage: req.flash('errorMessage'),
                offers,
                currentPage,
                totalPages: Math.ceil(offerCount / offerPerPage),
            })
    } catch (err) {
        console.log('Error on rendering offer page')
    }
}


//add offers page render
const addOffersGet = async (req, res) => {
    try {

        // Fetching active categories and available products
        const category = await categorySchema.find({ isBlocked: false })
        const product = await productSchema.find({ isAvailable: true })

        // Render the add offers page with categories and products
        res.render('admin/addOffers',
            {
                title: 'add-offers',
                alertMessage: req.flash('errorMessage'),
                category,
                product,
            })
    } catch (err) {
        console.log(`Error on listing offers : ${err}`)
    }
}
//add offer post
const addOffersPost = async (req, res) => {
    try {
        const { offerType, referenceIdCategory, referenceIdProduct, discountPercent } = req.body

        // Determine referenceId based on offerType

        let referenceId;
        if (offerType === 'category') {
            referenceId = referenceIdCategory
        }
        if (offerType === 'product') {
            referenceId = referenceIdProduct
        }

        //validating whether is the offertype and discount there

        if (!offerType || !discountPercent) {
            req.flash('errorMessage', 'Data not exist')
            return res.redirect('/admin/offers')
        }

        // Validating referenceId for category and product offerType


        if (offerType === 'category') {
            const category = await categorySchema.findById(referenceId)

            if (!category) {
                req.flash('errorMessage', 'category not found')
                return res.redirect('admin/offers')
            }
            //now we need to check that does this category already have any offer or not then remove that

            await offerSchema.deleteOne({ offerType, referenceId })
        }
        //update products discount with the reference type

        await productSchema.updateMany(
            { category: referenceId },
            { $set: { discount: discountPercent } }
        )

        //for product based updation
        if (offerType === 'product') {
            const product = await productSchema.findById(referenceId)

            if (!product) {
                req.flash('errorMessage', 'product could not found')
                return res.redirect('/admin/offers')
            }
            //removing existing offers
            await offerSchema.deleteOne({ offerType, referenceId })

            //adding new offers
            await productSchema.findByIdAndUpdate(
                referenceId,
                { $set: { discount: discountPercent } }
            )
        }
        // Save the new offer in the database

        const newoffer = new offerSchema({
            offerType,
            discountPercent,
            referenceId
        })

        await newoffer.save()
        req.flash('errorMessage', 'offer added successfully')
        return res.redirect('/admin/offers')
    } catch (err) {
        console.log(`Error on listing offers : ${err}`)
    }
}

// edit offer page render
const editOfferGet = async (req, res) => {
    try {
        const offer = await offerSchema.findById(req.params.id)
        const category = await categorySchema.find({ isBlocked: false })
        const product = await productSchema.find({ isAvailable: true })

        // Render the edit offer page with the current offer, categories, and products
        res.render('admin/editOffer', {
            title: 'Edit Offer',
            offer,
            category,
            product,
            alertMessage: req.flash('errorMessage'),
        })
    } catch (err) {
        console.log(`Error on getting offer for editing: ${err}`)
    }
}

// edit offer post
const editOffer = async (req, res) => {
    try {
        const { discountPercent } = req.body
        const offerId = req.params.id

        if (!discountPercent) {
            req.flash('errorMessage', 'Data not exist')
            return res.redirect(`/admin/edit-offer/${offerId}`)
        }

        const offerDetails = await offerSchema.findById(offerId)

        // Update products' discount based on offer type
        if (offerDetails.offerType === 'category') {
            const category = await categorySchema.findById(offerDetails.referenceId)

            if (!category) {
                req.flash('errorMessage', 'Category not found')
                return res.redirect(`/admin/edit-offer/${offerId}`)
            }

            await productSchema.updateMany(
                { category: offerDetails.referenceId },
                { $set: { discount: discountPercent } }
            )
        }

        if (offerDetails.offerType === 'product') {
            const product = await productSchema.findById(offerDetails.referenceId)

            if (!product) {
                req.flash('errorMessage', 'Product not found')
                return res.redirect(`/admin/edit-offer/${offerId}`)
            }

            await productSchema.findByIdAndUpdate(
                offerDetails.referenceId,
                { $set: { discount: discountPercent } }
            )
        }

        // Update the offer in the database
        await offerSchema.findByIdAndUpdate(offerId, { discountPercent: discountPercent })
        req.flash('errorMessage', 'Offer updated successfully')

        return res.redirect('/admin/offers')
    } catch (err) {
        console.log(`Error on updating offer: ${err}`)
    }
}



//delete offer

const deleteOffer = async (req, res) => {
    try {
        const offerID = req.params.id
        if (!offerID) {
            return res.status(404).json({ message: "Offer ID not found" })
        }

        // Find the offer for deletng
        const deletedOffer = await offerSchema.findById(offerID)
        if (!deletedOffer) {
            return res.status(404).json({ message: "Offer not found" })
        }

        // Delete the offer
        await offerSchema.findByIdAndDelete(offerID)

        // Reset discounts based on offerType and referenceId
        if (deletedOffer.offerType === 'category') {
            // Reset discounts for all products in this category
            await productSchema.updateMany(
                { category: deletedOffer.referenceId },
                { $set: { discount: 0 } }
            )
        } else if (deletedOffer.offerType === 'product') {
            // Reset discount for the specific product
            await productSchema.findByIdAndUpdate(
                deletedOffer.referenceId,
                { $set: { discount: 0 } }
            )
        }

        return res.status(200).json({ message: "Offer deleted successfully" })
    } catch (error) {
        console.log(`Error on deleting offer: ${error}`)
    }
}




module.exports = {
    offers,
    addOffersGet,
    addOffersPost,
    deleteOffer,
    editOfferGet,
    editOffer,


}