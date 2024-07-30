const categorySchema = require('../../model/categorySchema');
const productSchema = require('../../model/productSchema');
const orderSchema = require('../../model/orderSchema');
const express = require('express');
const path = require("path");
const fs = require('fs');
const walletSchema = require('../../model/walletSchema');


const orderList = async (req, res) => {
    try {
        // Pagination parameters
        const ordersPerPage = 8
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * ordersPerPage

        // Counting the total number of orders
        const ordersCount = await orderSchema.countDocuments()

        // Fetching the orders for the current page
        const orders = await orderSchema.find().sort({ createdAt: -1 }).skip(skip).limit(ordersPerPage)

        res.render('admin/listOrders', {
            title: 'orders',
            alertMessage: req.flash('errorMessage'),
            orders,
            currentPage,
            totalPages: Math.ceil(ordersCount / ordersPerPage)
        })
    } catch (err) {
        console.log(`Error on order list render: ${err}`)
    }
}

//rendering edit order page admin
const editOrder = async (req, res) => {
    try {
        const orderID = req.params.orderID
        const order = await orderSchema.findById(orderID).populate('products.productID').populate('address').sort({ createdAt: -1 })
        res.render('admin/editOrder', {
            title: 'Edit Order',
            alertMessage: req.flash('errorMessage'),
            order
        })
    } catch (err) {
        console.log(`Error on edit orders on admin: ${err}`)
    }
}

// editing order status
const editOrderPost = async (req, res) => {
    try {
        const orderID = req.params.orderID
        const newStatus = req.body.orderStatus
        const currentOrder = await orderSchema.findById(orderID)

        // Validate status change based on current status
        //current order if is confirmed then allowing only shipping otherwise no
        if (currentOrder.orderStatus === 'Confirmed' && newStatus !== 'Shipping') {
            req.flash('errorMessage', 'Cannot change order status from Confirmed except to Shipping')
            return res.redirect(`/admin/edit-order/${orderID}`)

            //current order if is shipping  then allowing only deleviring otherwise no
        } else if (currentOrder.orderStatus === 'Shipping' && newStatus !== 'Delivered') {
            req.flash('errorMessage', 'Order must be Delivered to change from Shipping')
            return res.redirect(`/admin/edit-order/${orderID}`)

        }
        // Update order status
        await orderSchema.findByIdAndUpdate(orderID, { orderStatus: newStatus })
        req.flash('errorMessage', 'Order status updated successfully')
        res.redirect('/admin/orders')

    } catch (err) {
        console.log(`Error on admin edit order post: ${err}`)
        req.flash('errorMessage', 'Failed to update order status')
        res.redirect('/admin/orders')
    }
}
// editing order status
const approveReturn = async (req, res) => {
    try {
        //getting orderid from the params
        const orderID = req.params.orderID
        //fetching the order from the db
        const currentOrder = await orderSchema.findById(orderID)

        //error message sending if order could not find
        if (!currentOrder) {
            return res.status(404).json({ message: 'could not find the order status' })
        }

        //changing to new status as returned (becuase this is an approval for return)
        if (currentOrder.orderStatus === 'Pending-Returned') {
            const newStatus = 'Returned'

            // Update order status
            await orderSchema.findByIdAndUpdate(orderID, { orderStatus: newStatus })

            //finding wallet for returning the money back
            const wallet = await walletSchema.findOne({ userID: currentOrder.userID })

            //calculating the final amount for returning after deducting of coupon discount
            const finalAmount = currentOrder.totalPrice - currentOrder.couponDiscount
            //returning to existing wallet
            if (wallet) {
                wallet.balance += finalAmount
                await wallet.save()

            } else {
                //creating new wallet in case of no existence of wallet and returning money there
                const newWallet = new walletSchema({
                    userID: currentOrder.userID,
                    balance: finalAmount,
                })
                //saving new wallet
                await newWallet.save()
            }

            return res.status(200).json({ message: 'successfully updated the status' })

        }

    } catch (err) {
        console.log(`Error on admin approve return order post: ${err}`)
        return res.status(404).json({ message: 'error on approving the return request' })

    }
}

const rejectReturn = async (req, res) => {
    try {
        //getting id from the params
        const orderID = req.params.orderID
        //finding current order using that id
        const currentOrder = await orderSchema.findById(orderID)

        //sending error message if could not get the id
        if (!currentOrder) {
            req.flash('errorMessage', 'Order id could/t find')
            return res.redirect('/admin/orders')
        }

        if (currentOrder.orderStatus !== 'Pending-Returned') {
            req.flash('errorMessage', 'Cannot reject order that is not Pending-Returned')
            return res.redirect('/admin/edit-order')
        }
        //updating the status to delivered because of rejected 

        const newStatus = 'Delivered'
        const reason = req.body.rejectingReturn

        // Update order status and reason for rejection
        await orderSchema.findByIdAndUpdate(orderID, { orderStatus: newStatus, reasonForRejection: reason })
        req.flash('errorMessage', 'Successfully Send the note and updated the status')
        return res.redirect('/admin/orders')

    } catch (err) {
        console.log(`Error on admin reject return order: ${err}`)
    }
}




module.exports = {
    orderList,
    editOrder,
    editOrderPost,
    approveReturn,
    rejectReturn,

}