const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const orderSchema = require('../../model/orderSchema');
const walletSchema = require('../../model/walletSchema');
const dotenv = require("dotenv").config()
const Razorpay = require('razorpay')
const fs = require("fs");
const PDFDocument = require("pdfkit-table");
const path = require('path')

const getOrders = async (req, res) => {
    try {
        // Pagination parameters
        const ordersPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * ordersPerPage;

        // Counting the total number of orders
        const ordersCount = await orderSchema.countDocuments()
        const orders = await orderSchema.find({ userID: req.session.user, orderStatus: { $in: ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Pending-Returned'] } }).populate('products.productID').sort({ createdAt: -1 }).skip(skip).limit(ordersPerPage)


        res.render('user/orders',
            {
                title: 'orders',
                alertMessage: req.flash('errorMessage'),
                orders,
                currentPage,
                totalPages: Math.ceil(ordersCount / ordersPerPage)
            })
    } catch (err) {
        console.log('error on getting orders page', err)
    }
}



const cancelOrder = async (req, res) => {
    try {
        const orderid = req.params.orderid
        const orderDetails = await orderSchema.findById(orderid).populate('products.productID')
        if (!orderDetails) {
            req.flash('errorMessage', 'Order id could/t find')
            return res.redirect('/checkout')
        }

        //when tje product is being canceled then returninh the quantiy back to stock of admin
        for (let product of orderDetails.products) {
            product.productID.productQuantity += product.quantity
            await product.productID.save()
        }


        //saving the new startus in the db
        orderDetails.orderStatus = 'Cancelled'
        orderDetails.isCancelled = true
        orderDetails.reasonForCancel = req.body.cancelledReason
        await orderDetails.save()

        //wallet finding
        const wallet = await walletSchema.findOne({ userID: req.session.user })


        if (orderDetails.paymentMethod === 'Razor pay' || orderDetails.paymentMethod === 'Wallet') {
            const finalAmount = orderDetails.totalPrice - orderDetails.couponDiscount
            if (wallet) {
                wallet.balance += finalAmount
                await wallet.save()
            } else {
                const newWallet = new walletSchema({
                    userID: req.session.user,
                    balance: finalAmount,
                })
                await newWallet.save()
            }
        }


        req.flash('errorMessage', 'product canceled successfully')
        res.redirect('/cancelled-orders')

    } catch (err) {
        console.log(`Error on cancel order post${err}`)
    }
}


const getCancelledOrders = async (req, res) => {
    try {
        // Pagination parameters
        const ordersPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * ordersPerPage;

        // Counting the total number of orders
        const ordersCount = await orderSchema.countDocuments()
        const orders = await orderSchema.find({ userID: req.session.user, orderStatus: { $in: ['Pending-Returned', 'Returned', 'Cancelled'] } }).populate('products.productID').sort({ updatedAt: -1 }).skip(skip).limit(ordersPerPage)
        res.render('user/cancelledOrders',
            {
                title: 'orders',
                alertMessage:
                    req.flash('errorMessage'),
                orders,
                currentPage,
                totalPages: Math.ceil(ordersCount / ordersPerPage)
            })
        console.log(orders)
    } catch (err) {
        console.log('error on getting orders page', err)
    }
}


const returnOrder = async (req, res) => {
    try {
        const orderid = req.params.orderid
        const orderDetails = await orderSchema.findById(orderid).populate('products.productID')
        if (!orderDetails) {
            req.flash('errorMessage', 'Order id could/t find')
            return res.redirect('/checkout')
        }
        //saving the new startus in the db
        orderDetails.orderStatus = 'Pending-Returned'
        orderDetails.returnRequest = req.body.returningReason
        await orderDetails.save()

        req.flash('errorMessage', 'request for return send successfully')
        res.redirect('/orders')

    } catch (err) {
        console.log(`Error on requesting return order post${err}`)
    }
}

//deleting or discarding the order which was pending to pay 
const discardOrder = async (req, res) => {
    try {
        const orderid = req.params.orderid
        const orderDetails = await orderSchema.findById(orderid).populate('products.productID')
        if (!orderDetails) {
            return res.status(404).json({ message: 'OrderID could not find' })
        }
        if (orderDetails.orderStatus = 'Pending') {

            await orderSchema.findByIdAndDelete(orderid)
            return res.status(200).json({ data: 'Successfully discarded the Order' })
        }

    } catch (err) {
        console.log(`Error on requesting return order post${err}`)
    }
}

//proceeding to pay using razorpay for the order which was pending to pay earlier
const proceedPayment = async (req, res) => {
    try {
        const orderid = req.params.orderid
        const orderDetails = await orderSchema.findById(orderid).populate('products.productID')
        if (!orderDetails) {
            return res.status(404).json({ message: 'OrderID could not find' })
        }
        if (orderDetails.orderStatus = 'Pending') {

            await orderSchema.findByIdAndDelete(orderid)
            return res.status(200).json({ data: 'Successfully discarded the Order' })
        }

    } catch (err) {
        console.log(`Error on requesting return order post${err}`)
    }
}


const getRazorPayForPendingOrder = async (req, res) => {
    try {

        return res.status(200).json({ success: 'Successfully discarded the Order' })


    } catch (err) {
        console.log(`Error on requesting return order post${err}`)
    }
}

const renderRazorPay = async (req, res) => {
    try {

        const orderID = req.body.orderid;
        const orderDetails = await orderSchema.findById(orderID).populate('userID')

        var instance = new Razorpay({ key_id: process.env.RAZORPAY_SECRET_ID, key_secret: process.env.RAZORPAY_SECRET_KEY })

        instance.orders.create({
            amount: Math.round(orderDetails.totalPrice * 100),
            currency: "INR",
            receipt: "receipt#1",
        }, (err, order) => {
            if (err) {
                console.log("Failed to create an order ID", err)
                return res.status(500).json({ error: `Failed to create a order ID ${err}` })
            }

            return res.status(200).json({ success: "render razor pay", orderID: order.id, totalAmount: orderDetails.totalPrice, userName: orderDetails.userID.userName, phone: orderDetails.userID.phone, email: orderDetails.userID.email })
        })

    } catch (err) {
        console.log("error on applying coupon fetch in order", err)
    }
}

const postOrderPlaced = async (req, res) => {
    try {
        const orderID = req.body.orderid

        const pendingOrderDetail = await orderSchema.findById(orderID).populate("products.productID")
        pendingOrderDetail.orderStatus = "Confirmed";
        await pendingOrderDetail.save()

        //decrease the quantity as needed
        for (const product of pendingOrderDetail.products) {
            product.productID.productQuantity -= product.quantity;
            await product.productID.save();
        }

        // empty the cart 
        return res.status(200).json({ success: 'Order Placed successfully' })

    } catch (err) {
        console.log('error on order placing post', err)
    }
}


const downloadInvoice = async (req, res) => {
    try {
        const orderID = req.params.orderID;

        // Get the order details from order collection
        const orderDetails = await orderSchema
            .findById(orderID)
            .populate("products.productID");

        const doc = new PDFDocument();
        const filename = `Aura Candle Studio Invoice ${Date.now()}.pdf`;

        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        // Add header aligned to center
        doc
            .font("Helvetica-Bold")
            .fontSize(36)
            .text("Aura Candle Studio", { align: "center", margin: 10 });
        doc
            .font("Helvetica-Bold")
            .fillColor("grey")
            .fontSize(8)
            .text("Brighten Every Moment with Aura ", {
                align: "center",
                margin: 10,
            });
        doc.moveDown();

        doc.fontSize(10).fillColor("blue").text(`Invoice #${orderID}`);
        doc.moveDown();
        doc.moveDown();

        // Add total sales report
        doc
            .fillColor("black")
            .text(`Total products: ${orderDetails.products.length}`);
        doc
            .fillColor("black")
            .text(
                `Shipping Charge: ${orderDetails.totalPrice < 500 ? "RS 50" : "Free"}`
            );
        doc
            .fillColor("black")
            .text(
                `Coupon Discount: ${orderDetails.couponDiscount}`
            );
        doc
            .fontSize(10)
            .fillColor("red")
            .text(`Total Amount: Rs ${orderDetails.totalPrice.toLocaleString()}`);
        doc.moveDown();

        doc
            .fontSize(10)
            .fillColor("black")
            .text(`Payment method: ${orderDetails.paymentMethod}`);
        doc.text(`Order Date: ${orderDetails.createdAt.toDateString()}`);
        doc.moveDown();
        doc.moveDown();

        // Add address details of the company
        doc
            .fontSize(10)
            .fillColor("black")
            .text(`Address: Trivandrum, Thiruvallom`);
        doc.text(`Pincode: 10012`);
        doc.text(`Phone: 234 567 8890`);
        doc.moveDown();
        doc.moveDown();

        doc.fontSize(12).text(`Invoice.`, { align: "center", margin: 10 });
        doc.moveDown();

        const tableData = {
            headers: ["Product Name", "Quantity", "Price", "Discount", "Total"],
            rows: orderDetails.products.map((product) => {
                return [
                    product?.productName,
                    product?.quantity,
                    `Rs ${product?.price}`,
                    `${product?.discount} %`,
                    `Rs ${(
                        product.price *
                        (1 - product.discount / 100) *
                        product.quantity
                    ).toFixed(2)}`,
                ];
            }),
        };

        // Customize the appearance of the table
        await doc.table(tableData, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(8),
            hLineColor: "#b2b2b2", // Horizontal line color
            vLineColor: "#b2b2b2", // Vertical line color
            textMargin: 2, // Margin between text and cell border
        });

        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
        doc.fontSize(12).text(`Thank You.`, { align: "center", margin: 10 });
        doc.moveDown();

        // Finalize the PDF document
        doc.end();
    } catch (err) {
        console.log(`Error on downloading the invoice pdf ${err}`);
        res.status(500).send("Error generating invoice");
    }
};


module.exports = {
    getOrders,
    cancelOrder,
    getCancelledOrders,
    returnOrder,
    discardOrder,
    proceedPayment,
    getRazorPayForPendingOrder,
    renderRazorPay,
    postOrderPlaced,
    downloadInvoice
}