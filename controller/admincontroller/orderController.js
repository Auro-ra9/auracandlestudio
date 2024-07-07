const categorySchema = require('../../model/categorySchema')
const productSchema = require('../../model/productSchema')
const orderSchema = require('../../model/orderSchema')
const express = require('express');
const path = require("path");
const fs = require('fs');


const orderList = async (req, res) => {
    try {
        // Pagination parameters
        const ordersPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * ordersPerPage;

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
        });
    } catch (err) {
        console.log(`Error on order list render: ${err}`);
    }
};

//rendering edit order page admin
const editOrder = async (req, res) => {
    try {
        const orderID = req.params.orderID;
        const order = await orderSchema.findById(orderID).populate('products.productID').populate('address').sort({ createdAt: -1 });
        res.render('admin/editOrder', {
            title: 'Edit Order',
            alertMessage: req.flash('errorMessage'),
            order
        });
    } catch (err) {
        console.log(`Error on edit orders on admin: ${err}`);
    }
};

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
            return res.redirect('/admin/orders')
            
            //current order if is shipping  then allowing only deleviring otherwise no
        } else if (currentOrder.orderStatus === 'Shipping' && newStatus !== 'Delivered') {
            req.flash('errorMessage', 'Order must be Delivered to change from Shipping')
            return res.redirect('/admin/orders')
            
        }
        // Update order status
        await orderSchema.findByIdAndUpdate(orderID, { orderStatus: newStatus })
        req.flash('errorMessage', 'Order status updated successfully')
        res.redirect('/admin/orders')

    } catch (err) {
        console.log(`Error on admin edit order post: ${err}`);
        req.flash('errorMessage', 'Failed to update order status')
        res.redirect('/admin/orders')
    }
}




module.exports = {
    orderList,
    editOrder,
    editOrderPost,

}