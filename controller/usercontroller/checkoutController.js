const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const orderSchema = require('../../model/orderSchema');
const couponSchema = require('../../model/couponSchema')
const dotenv=require("dotenv").config()
const Razorpay=require('razorpay')

//renter the checkout page
const checkoutRender = async (req, res) => {
    try {
        const profileDetails = await userSchema.findById(req.session.user)
        const productInCart = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')

        const currentDate = new Date()
        const coupons = await couponSchema.find({ expiryDate: { $gte: currentDate }, isActive: true })
        if (!productInCart) {
            req.flash('errorMessage', 'cart is empty')
            return res.redirect('/cart')
        }

        for (const item of productInCart.items) {
            if (item.productCount > item.productID.productQuantity) {
                req.flash('errorMessage', 'product unavailable')
                return res.redirect('/cart')
            }
        }
        productInCart.items.sort((productA, productB) => productB.createdAt - productA.createdAt)



        res.render('user/checkout', {
            title: "checkout",
            user: req.session.user,
            alertMessage:
                req.flash('errorMessage'),
            profileDetails,
            productInCart: productInCart,

            coupons
        })

    } catch (err) {
        console.log("error on checkout render ", err);
    }
}

const addAddress = async (req, res) => {
    try {
        const profileID = req.session.user;

        if (!profileID) {
            req.flash('errorMessage', "Profile id not found");
            return res.redirect('/checkout');
        }

        const newCity = req.body.city.trim();
        const newHomeAddress = req.body.homeAddress.trim();
        const newAreaAddress = req.body.areaAddress.trim();
        const newPincode = req.body.pincode.trim();
        const newState = req.body.state.trim();
        const newLandmark = req.body.landmark.trim();

        if (!newCity || !newAreaAddress || !newHomeAddress || !newPincode || !newState || !newLandmark) {
            req.flash('errorMessage', "All fields are required");
            return res.redirect('/checkout');
        }

        const addressDetails = {
            pincode: newPincode,
            homeAddress: newHomeAddress,
            areaAddress: newAreaAddress,
            city: newCity,
            landmark: newLandmark,
            state: newState
        }

        console.log(addressDetails);
        // push the data inside the user address
        const userDetails = await userSchema.findById(req.session.user);

        if (userDetails.address.length >= 4) {
            req.flash('errorMessage', "address limit reached")
            return res.redirect('/checkout')
        }

        userDetails.address.push(addressDetails)

        await userDetails.save()

        req.flash('errorMessage', "Address added successfully");
        return res.redirect('/checkout');

    } catch (err) {
        console.log("Error on adding address on checkout ", err);
    }
};

const editAddress = async (req, res) => {
    try {
        const index = req.params.index

        if (!index) {
            req.flash('errorMessage', " user details couldn't find")
            return res.redirect('/checkout')
        }

        const { homeAddress, areaAddress, pincode, state, landmark, city } = req.body
        console.log(Number(pincode));

        const userDetails = await userSchema.findById(req.session.user)

        userDetails.address[index].homeAddress = homeAddress
        userDetails.address[index].areaAddress = areaAddress
        userDetails.address[index].pincode = Number(pincode)
        userDetails.address[index].state = state
        userDetails.address[index].city = city
        userDetails.address[index].landmark = landmark

        await userDetails.save()

        req.flash('errorMessage', "Address edited successfully");
        res.redirect('/checkout')
    } catch (err) {
        console.log(`error on edit address modal post in checkout page: ${err}`)
    }
}




const deleteAddress = async (req, res) => {
    try {
        const index = req.params.index

        if (!index) {
            return res.status(404).json({ message: 'Deletion failed, could not find the details ' })
        }

        const userDetails = await userSchema.findById(req.session.user)
        console.log(userDetails)
        const deletedAddress = userDetails.address.splice(index, 1)

        if (deletedAddress.length != 0) {
            await userDetails.save()
            return res.status(200).json({ message: 'address removed' })
        }
    } catch (err) {
        console.log(`error on deleting address post${err}`)
    }
}

    const postOrderPlaced = async (req, res) => {
        try {
            /*selected address option is the index of the selected address in the frontend,
            and it is passed as the integer no, here in this variable*/
            const selectedAddressOption = parseInt(req.body.selectedAddressOption)
            const selectedPaymentOption = parseInt(req.body.selectedPaymentOption)
            const paymentOptions = ['Cash on delivery', 'Razor pay', 'Wallet']
            const user = await userSchema.findById(req.session.user)
            const cart = await cartSchema.findOne({ userID: user.id }).populate('items.productID')
            console.log(selectedPaymentOption)

            let totalPrice = 0

            cart.items.forEach((item) => {
                totalPrice += item.productCount * (item.productID.productPrice * (1 - item.productID.discount / 100))
            })

            const neworder = new orderSchema({
                userID: user._id,
                products: cart.items.map(item => ({
                    productID: item.productID,
                    productName: item.productID.productName,
                    brand: item.productID.brand,
                    quantity: item.productCount,
                    price: item.productID.productPrice,
                    discount: item.productID.discount,
                    productImage: item.productID.image[0]
                })),
                totalPrice: totalPrice,
                address: {
                    pincode: user.address[selectedAddressOption].pincode,
                    homeAddress: user.address[selectedAddressOption].homeAddress,
                    areaAddress: user.address[selectedAddressOption].areaAddress,
                    city: user.address[selectedAddressOption].city,
                    landmark: user.address[selectedAddressOption].landmark,
                    state: user.address[selectedAddressOption].state,
                },
                couponDiscount:cart.couponDiscount,
                paymentMethod: paymentOptions[selectedPaymentOption],
                orderStatus: "Confirmed",

            })
            await neworder.save()


            //decrease the quantity as needed

            for (const item of cart.items) {
                item.productID.productQuantity -= item.productCount;
                await item.productID.save();
            }


            await cartSchema.findByIdAndDelete(cart.id)


            // empty the cart 
            return res.status(200).json({ success: 'Order Placed successfully' })


        } catch (err) {
            console.log('error on order placing post', err)
        }
    }

    const orderConfirmed = (req, res) => {
        try {
            res.render('user/orderConfirmed',
                {
                    title: 'order-placed',
                    alertMessage:
                        req.flash('errorMessage')
                })
        } catch (err) {
            console.log('error on order confirm page rendering get:', err)
        }
    }

    const getCoupon = async (req, res) => {
        try {

            const { coupon } = req.body

            if (!coupon) {
                return res.status(404).json({ error: "Invalid coupon id" })
            }

            const couponDeatils = await couponSchema.findById(coupon);

            return res.status(200).json({ success: "Coupon finded", discount: couponDeatils.discount, minPurchase: couponDeatils.minAmount })

        } catch (err) {
            console.log("error on getting coupon details fetch ", err);
        }
    }

    const applyCoupon = async (req, res) => {
        try {

            const { couponID } = req.body

            if (!couponID) {
                return res.status(404).json({ error: "Invalid coupon id" })
            }

            const couponDeatils = await couponSchema.findById(couponID);

            const cart = await cartSchema.findOne({ userID: req.session.user })

            if (couponDeatils.minAmount > cart.payableAmount) {
                return res.status(404).json({ minNotreached: "minimum amount not reached" })
            }

            if (cart.couponID != "") {
                const oldCoupon = await couponSchema.findById(cart.couponID)
                cart.payableAmount += oldCoupon.discount
            }

            cart.payableAmount -= couponDeatils.discount;
            cart.couponID = couponID;
            cart.couponDiscount = couponDeatils.discount;
            await cart.save()

            return res.status(200).json({ success: "coupon applied", payableAmount: cart.payableAmount, discount: couponDeatils.discount })



        } catch (err) {
            console.log("error on applying coupon fetch", err)
        }
    }



    const removeCoupon = async (req, res) => {
        try {

            const cart = await cartSchema.findOne({ userID: req.session.user })

            if (cart.couponID) {
                const oldCoupon = await couponSchema.findById(cart.couponID)
                cart.payableAmount += oldCoupon.discount
                cart.couponID = ''
                cart.couponDiscount = 0
                await cart.save()
            }


            return res.status(200).json({ success: "coupon applied", payableAmount: cart.payableAmount })



        } catch (err) {
            console.log("error on applying coupon fetch", err)
        }
    }



    const renderRazorPay = async (req, res) => {
        try {

            const cart = await cartSchema.findOne({ userID: req.session.user })
            const userDetails= await userSchema.findById(req.session.user)

            var instance = new Razorpay({ key_id: process.env.RAZORPAY_SECRET_ID, key_secret: process.env.RAZORPAY_SECRET_KEY })

            instance.orders.create({
                amount: Math.round(cart.payableAmount * 100),
                currency: "INR",
                receipt: "receipt#1",
            },(err,order)=>{
                if(err){
                    console.log("Failed to create an order ID", err)
                    return res.status(500).json({error:`Failed to create a order ID ${err}`})
                }

                return res.status(200).json({ success: "render razor pay", orderID:order.id,totalAmount:cart.payableAmount, userName:userDetails.userName, phone:userDetails.phone, email:userDetails.email })
            })

        } catch (err) {
            console.log("error on applying coupon fetch", err)
        }
    }


    const pendingRazorPay = async (req, res) => {
        try {
            /*selected address option is the index of the selected address in the frontend,
            and it is passed as the integer no, here in this variable*/
            const selectedAddressOption = parseInt(req.body.selectedAddressOption)
            const selectedPaymentOption = parseInt(req.body.selectedPaymentOption)
            const paymentOptions = ['Cash on delivery', 'Razor pay', 'Wallet']
            const user = await userSchema.findById(req.session.user)
            const cart = await cartSchema.findOne({ userID: user.id }).populate('items.productID')
            console.log(selectedPaymentOption)

            let totalPrice = 0

            cart.items.forEach((item) => {
                totalPrice += item.productCount * (item.productID.productPrice * (1 - item.productID.discount / 100))
            })

            const neworder = new orderSchema({
                userID: user._id,
                products: cart.items.map(item => ({
                    productID: item.productID,
                    productName: item.productID.productName,
                    brand: item.productID.brand,
                    quantity: item.productCount,
                    price: item.productID.productPrice,
                    discount: item.productID.discount,
                    productImage: item.productID.image[0]
                })),
                totalPrice: totalPrice,
                address: {
                    pincode: user.address[selectedAddressOption].pincode,
                    homeAddress: user.address[selectedAddressOption].homeAddress,
                    areaAddress: user.address[selectedAddressOption].areaAddress,
                    city: user.address[selectedAddressOption].city,
                    landmark: user.address[selectedAddressOption].landmark,
                    state: user.address[selectedAddressOption].state,
                },
                couponDiscount:cart.couponDiscount,
                paymentMethod: paymentOptions[selectedPaymentOption],
                orderStatus: "Pending",

            })
            await neworder.save()

            await cartSchema.findByIdAndDelete(cart.id)

            // empty the cart 
            return res.status(200).json({ success: 'Order pending' })


        } catch (err) {
            console.log('error on order placing post', err)
        }
    }
    const paymentFailedMessage = async (req, res) => {
        try {
            res.render('user/paymentFailed',{title:"payment Failed"})

        } catch (err) {
            console.log('error on order placing post', err)
        }
    }

    



module.exports = {
    checkoutRender,
    addAddress,
    editAddress,
    deleteAddress,
    postOrderPlaced,
    orderConfirmed,
    getCoupon,
    applyCoupon,
    removeCoupon,
    renderRazorPay,
    pendingRazorPay,
    paymentFailedMessage,
}