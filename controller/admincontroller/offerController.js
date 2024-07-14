const categorySchema = require('../../model/categorySchema');
const offerSchema = require('../../model/offerSchema');
const productSchema = require('../../model/productSchema');
const mongoose= require('mongoose')


const offers =async (req, res) => {
    try {
        // Pagination parameters
        const offerPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * offerPerPage;
        // Counting the total number of offer
        const offerCount = await offerSchema.countDocuments()

       
        // Fetching the offer for the current page
        const offers = await offerSchema.find().sort({ createdAt: -1 }).skip(skip).limit(offerPerPage)

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

const addOffersGet = async(req, res) => {
    try {
        const category=await categorySchema.find({isBlocked:false})
        const product=await productSchema.find({isAvailable:true})

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
        const { offerType,
            discountPercent,
            isActive } = req.body

        const newoffer = new offerSchema({
            offerType,
            discountPercent,
            isActive
        })

        await newoffer.save()
        req.flash('errorMessage','offer added successfully')
        return res.redirect('/admin/offers')
    } catch (err) {
        console.log(`Error on listing offers : ${err}`)
    }
}

const deleteOffer = async (req, res) => {
    try {
        const offerID = req.params.offerID
        if (!offerID) {
            return res.status(404).json({ message: "offer ID not found" })
        }
        const deletedoffer = await offerSchema.findByIdAndDelete(offerID)
        if (deletedoffer) {
            return res.status(200).json({ message: "offer deleted" })
        } else {
            return res.status(404).json({ message: "offer not found" })
        }
    } catch (error) {
        console.log(`Error on deleting offer: ${error}`)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}




//block offer
const blockOffer = async (req, res) => {
    try {

        const offerID = req.params.offerID

        if (!offerID) {
            return res.status(404).json({ message: "offer id not found" })
        }

        const blockoffer = await offerSchema.findByIdAndUpdate(offerID, { isActive: false })

        if (blockoffer) {
            return res.status(200).json({ message: "offer blocked" })
        }

    } catch (err) {
        console.log("Error on blocking the offer", err)
    }
}

//unblock offers
const unblockOffer = async (req, res) => {
    try {

        const offerID = req.params.offerID

        if (!offerID) {
            return res.status(404).json({ message: "offer id not found" })
        }

        const unblockedOffer = await offerSchema.findByIdAndUpdate(offerID, { isActive: true })

        if (unblockedOffer) {
            return res.status(200).json({ message: "offer unblocked" })
        }

    } catch (err) {
        console.log("Error on unblocking the offer", err)
    }
}

//edit offer page render
const editOfferGet = async (req, res) => {
    try {
        const offerID = req.params.offerID
        const offer = await offerSchema.findById(offerID)
        res.render('admin/editOffer', {
            title: 'Edit offer})',
            alertMessage: req.flash('errorMessage'),
            offer
        })
    } catch (err) {
        console.log(`error on editing offer: ${err}`)
        res.status(500).send('Error retrieving offer')
    }
}

const editOffer = (req, res) => {
    try {
        //collect details from frontend
        const { offerType,
            discountPercent,
            isActive } = req.body
        const offerID = req.params.offerID

        if (!offerID) {
            return res.status(404).json({ message: "offer id not found" })
        }

        //updating the details on db
        offerSchema.findByIdAndUpdate(offerID, {
            offerType: offerType,
            discountPercent: discountPercent,
            isActive: isActive
        })
            .then((elem) => {
                req.flash('errorMessage', 'offer Updated successfully')
                res.redirect('/admin/offers')
            }).catch((err) => {
                console.log(`Error while updating the offer ${err}`)
                req.flash('errorMessage', 'offer is not updated')
                res.redirect('/admin/offers')
            })
    } catch (err) {
        console.log(`error on editing offer: ${err}`)
        req.flash('errorMessage', 'Oops the action is not completed')
        res.redirect('/admin/offers')
    }
}



module.exports = {
    offers,
    addOffersGet,
    addOffersPost,
    deleteOffer,
    blockOffer,
    unblockOffer,
    editOfferGet,
    editOffer,

}