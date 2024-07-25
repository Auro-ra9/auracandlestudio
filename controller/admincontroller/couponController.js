const categorySchema = require('../../model/categorySchema')
const productSchema = require('../../model/productSchema')
const orderSchema = require('../../model/orderSchema')
const couponSchema = require('../../model/couponSchema')
const express = require('express')
const path = require("path")
const fs = require('fs')

const coupons = async (req, res) => {

    try {
        // Pagination parameters
        const couponsPerPage = 8
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * couponsPerPage

        // Counting the total number of coupons
        const couponsCount = await couponSchema.countDocuments()
        const coupons = await couponSchema.find().sort({ createdAt: -1 }).skip(skip).limit(couponsPerPage)
        res.render('admin/coupons',
            {
                title: 'coupons',
                alertMessage: req.flash('errorMessage'),
                coupons,
                currentPage,
                totalPages: Math.ceil(couponsCount / couponsPerPage)
            })
    } catch (err) {
        console.log(`Error on listing coupons : ${err}`)
    }
}
//add coupons page render

const addCouponsGet = (req, res) => {
    try {
        res.render('admin/addCoupons',
            {
                title: 'add-coupons',
                alertMessage: req.flash('errorMessage')
            })
    } catch (err) {
        console.log(`Error on listing coupons : ${err}`)
    }
}
//add coupon post
const addCouponsPost = async (req, res) => {
    try {
        const { couponName,
            couponCode,
            discount,
            expiryDate,
            minAmount,
            isActive } = req.body

        const newCoupon = new couponSchema({
            couponName,
            couponCode,
            discount,
            expiryDate,
            minAmount,
            isActive
        })

        await newCoupon.save()
        req.flash('errorMessage','coupon added successfully')
        return res.redirect('/admin/coupons')
    } catch (err) {
        console.log(`Error on listing coupons : ${err}`)
    }
}

const deleteCoupon = async (req, res) => {
    try {
        const couponID = req.params.couponID
        if (!couponID) {
            return res.status(404).json({ message: "Coupon ID not found" })
        }
        const deletedCoupon = await couponSchema.findByIdAndDelete(couponID)
        if (deletedCoupon) {
            return res.status(200).json({ message: "Coupon deleted" })
        } else {
            return res.status(404).json({ message: "Coupon not found" })
        }
    } catch (error) {
        console.log(`Error on deleting coupon: ${error}`)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}




//block coupon
const blockCoupon = async (req, res) => {
    try {

        const couponID = req.params.couponID

        if (!couponID) {
            return res.status(404).json({ message: "coupon id not found" })
        }

        const blockCoupon = await couponSchema.findByIdAndUpdate(couponID, { isActive: false })

        if (blockCoupon) {
            return res.status(200).json({ message: "Coupon blocked" })
        }

    } catch (err) {
        console.log("Error on blocking the Coupon", err)
    }
}

//unblock coupons
const unblockCoupon = async (req, res) => {
    try {

        const couponID = req.params.couponID

        if (!couponID) {
            return res.status(404).json({ message: "coupon id not found" })
        }

        const unblockedCoupon = await couponSchema.findByIdAndUpdate(couponID, { isActive: true })

        if (unblockedCoupon) {
            return res.status(200).json({ message: "coupon unblocked" })
        }

    } catch (err) {
        console.log("Error on unblocking the coupon", err)
    }
}

//edit coupon page render
const editCouponGet = async (req, res) => {
    try {
        const couponID = req.params.couponID
        const coupon = await couponSchema.findById(couponID)
        res.render('admin/editCoupon', {
            title: 'Edit coupon})',
            alertMessage: req.flash('errorMessage'),
            coupon
        })
    } catch (err) {
        console.log(`error on editing coupon: ${err}`)
        res.status(500).send('Error retrieving coupon')
    }
}

const editCoupon = (req, res) => {
    try {
        //collect details from frontend
        const { couponName,
            couponCode,
            discount,
            expiryDate,
            minAmount,
            isActive } = req.body
        const couponID = req.params.couponID

        if (!couponID) {
            return res.status(404).json({ message: "coupon id not found" })
        }

        //updating the details on db
        couponSchema.findByIdAndUpdate(couponID, {
            couponName: couponName,
            couponCode: couponCode,
            discount: discount,
            expiryDate: expiryDate,
            minAmount: minAmount,
            isActive: isActive
        })
            .then((elem) => {
                req.flash('errorMessage', 'Coupon Updated successfully')
                res.redirect('/admin/coupons')
            }).catch((err) => {
                console.log(`Error while updating the coupon ${err}`)
                req.flash('errorMessage', 'coupon is not updated')
                res.redirect('/admin/coupons')
            })
    } catch (err) {
        console.log(`error on editing coupon: ${err}`)
        req.flash('errorMessage', 'Oops the action is not completed')
        res.redirect('/admin/coupons')
    }
}




module.exports = {
    coupons,
    addCouponsGet,
    addCouponsPost,
    deleteCoupon,
    blockCoupon,
    unblockCoupon,
    editCouponGet,
    editCoupon

}