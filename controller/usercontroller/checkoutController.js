const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const orderSchema = require('../../model/orderSchema');

const checkoutRender = async (req, res) => {
    try {
        const profileDetails = await userSchema.findById(req.session.user)
        const productInCart = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')

        productInCart.items.sort((productA, productB) => productB.createdAt - productA.createdAt)

        let subTotal = 0
        let total = 0
        let totalDiscount = 0

        productInCart.items.forEach((product) => {
            subTotal += product.productCount * (product.productID.productPrice)
            total += (product.productID.productPrice * (1 - product.productID.discount / 100) * (product.productCount))
        })
        totalDiscount = subTotal - total

        res.render('user/checkout', {
            title: "checkout",
            user: req.session.user,
            alertMessage:
                req.flash('errorMessage'),
            profileDetails,
            productInCart: productInCart,
            subTotal,
            total,
            totalDiscount
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

        const user = await userSchema.findById(req.session.user)
        const cart = await cartSchema.findOne({ userID: user.id }).populate('items.productID')


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
            paymentMethod: 'Cash on delivery',
            orderStatus: "Confirmed",

        })
        await neworder.save()
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

module.exports = {
    checkoutRender,
    addAddress,
    editAddress,
    deleteAddress,
    postOrderPlaced,
    orderConfirmed

}