const userSchema=require('../../model/userSchema')
const productSchema=require('../../model/productSchema')
const wishlistSchema=require('../../model/wishlistSchema')
const orderSchema=require('../../model/orderSchema')


const viewWishlist = async (req, res) => {
    try {
      // Pagination parameters
      const wishlistPerPage = 8;
      const currentPage = parseInt(req.query.page) || 1;
      const skip = (currentPage - 1) * wishlistPerPage;
  
      // Find the wishlist for the user and populate product details
      const productInWishlist = await wishlistSchema.findOne({ userID: req.session.user }).populate('items.productID').lean();
  
      if (productInWishlist) {
        // Sort products by createdAt in descending order
        productInWishlist.items.sort((productA, productB) => productB.createdAt - productA.createdAt);
  
        // Calculate total number of items and pages
        const totalItems = productInWishlist.items.length;
        const totalPages = Math.ceil(totalItems / wishlistPerPage);
  
        // Paginate the items
        const paginatedItems = productInWishlist.items.slice(skip, skip + wishlistPerPage);
  
        // Render the wishlist page with the paginated items
        res.render('user/wishlist', {
          title: 'Wishlist',
          alertMessage: req.flash('errorMessage'),
          productInWishlist: { ...productInWishlist, items: paginatedItems },
          currentPage,
          totalPages,
          query: req.query
        });
      } else {
        res.render('user/wishlist', {
          title: 'Wishlist',
          alertMessage: req.flash('errorMessage'),
          productInWishlist: { items: [] },
          currentPage,
          totalPages: 1,
          query: req.query
        });
      }
    } catch (err) {
      console.log(`error on wishlist ${err}`);
      res.status(500).send('An error occurred');
    }
  };
  

const addToWishlist = async (req, res) => {
    try {
        const productID = req.params.productID
        if (!productID) {
            return res.status(404).json({ message: 'product could not find' })
        }

        const productDetails = await productSchema.findById(productID)

        if (!productDetails) {
            return res.status(404).json({ message: 'product could not find' })
        }
        //checking whether the user already have the wishlist, if it yes then adding to the existing or creating new

        const wishlist = await wishlistSchema.findOne({ userID: req.session.user }).populate('items.productID')

        if (!wishlist) {
            const newWishlist = new wishlistSchema({
                userID: req.session.user,
                items: [{
                    productID: productDetails._id,
                   
                }]
            })
            await newWishlist.save()
        } else {
            // check product is therre in wishlist
            let productInWishlist = false

            for (const checkProduct of wishlist.items) {
                if (checkProduct.productID.id === productID) {
                    productInWishlist = true
                    return res.status(404).json({ existInWishlist: 'product already in wishlist' })
                }
            }

            if (!productInWishlist) {
                wishlist.items.push({
                    productID: productDetails._id,
                    
                })

                await wishlist.save()
            }
        }

        return res.status(200).json({ success: "Product addded to wishlist" })

    } catch (err) {
        console.log(`error on adding to wishlist post${err}`)
    }
}

const deleteFromWishlist = async (req, res) => {
    try {
        const productID = req.params.productID
        const userID = req.session.user
        const wishlist = await wishlistSchema.findOne({ userID: userID }).populate('items.productID')

        if (!wishlist) {
            return res.status(404).json({ message: 'wishlist not found' })
        }

        const newProductList = wishlist.items.filter((wishlistProduct) => {
            if (wishlistProduct.productID.id != productID) {
                return wishlistProduct
            }
        })

        wishlist.items = newProductList

        await wishlist.save()


        return res.status(200).json({ success: "Product removed from wishlist" })
    } catch (err) {
        console.log(`error on deleting from wishlist ${err}`)
        return res.status(500).json({ message: 'Failed to remove product from wishlist' })
    }
}

module.exports={
    viewWishlist,
    addToWishlist,
    deleteFromWishlist,
}