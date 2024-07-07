const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const bcrypt = require('bcrypt');
const categorySchema = require('../../model/categorySchema');

// const homeRender = async (req, res) => {
//   try {
//      // Find all active categories
//      const categories = await categorySchema.find({ isBlocked:false});

//      // Extract category names
//      const allCategoryNames = categories.map(item => item.categoryName);



//      // Extract query parameters with default values
//      const selectedCategory = req.query.productCategory ? req.query.productCategory : allCategoryNames;
//      const minPrice = parseInt(req.query.minPrice) || 0;
//      const maxPrice = parseInt(req.query.maxPrice) || 100000;
//     //  const productRating = parseInt(req.query.productRating) || 0;
//      const productDiscount = parseInt(req.query.productDiscount) || 0;
//      const productPriceSort = parseInt(req.query.productPriceSort) || 0;
//      const userSearch = req.query.userSearch || "";


//      // Pagination parameters
//      const productsPerPage = 8;
//      const currentPage = parseInt(req.query.page) || 1;
//      const skip = (currentPage - 1) * productsPerPage;


//        // Query for products with filters
//        const productQuery = {
//         productName: { $regex: userSearch, $options: "i" },
//         productCategory: { $in: selectedCategory },
//         isAvailable: true,
//         productPrice: { $gte: minPrice, $lte: maxPrice },
//         // productRating: { $gte: productRating }
//     };

//     // Sort options
//     let sortOption = {};
//     if (productPriceSort === 1) {
//         sortOption = { productPrice: -1 };
//     } else if (productDiscount !== 0) {
//         sortOption = { discount: productDiscount };
//     } else {
//         sortOption = { createdAt: -1 }; // Default sort by createdAt descending
//     }

//        // Fetch products with applied filters and sorting
//        const products = await productSchema.find(productQuery)
//        .sort(sortOption)
//        .skip(skip)
//        .limit(productsPerPage);
// // Count the total number of products matching the query
// const productsCount = await productSchema.countDocuments(productQuery);

// const productsFirst= await productSchema.find({isAvailable:true}).sort({createdAt:-1})


//      res.render('user/home', {
//       title: 'home',
//       alertMessage: req.flash('errorMessage'),
//       user: req.session.user,
//       productsFirst,
//       products,
//       category:categories,
//       pageNumber: Math.ceil(productsCount / productsPerPage),
//       currentPage,
//       totalPages: productsCount

//     })
//   } catch (err) {
//     console.log(`Error on home render get ${err}`);
//   }
// }



const homeRender = async (req, res) => {
    try {
        // Find all active categories
        const categories = await categorySchema.find({ isBlocked: false });

        // Extract query parameters with default values
        const selectedCategories = req.query.productCategory 
            ? (Array.isArray(req.query.productCategory) ? req.query.productCategory : [req.query.productCategory]) 
            : categories.map(cat => cat._id.toString());

        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        const sortBy = req.query.sortBy || 'newArrivals';
        const userSearch = req.query.search || "";

        // Pagination parameters
        const productsPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * productsPerPage;

        // Query for products with filters
        const productQuery = {
            productName: { $regex: userSearch, $options: "i" },
            category: { $in: selectedCategories },
            isAvailable: true,
            productPrice: { $gte: minPrice, $lte: maxPrice },
        };

        // Sort options based on provided croterias
        let sortOption = {};
        switch (sortBy) {
            case 'priceLowToHigh':
                sortOption = { productPrice: 1 };
                break;
            case 'priceHighToLow':
                sortOption = { productPrice: -1 };
                break;
            case 'nameAsc':
                sortOption = { productName: 1 };
                break;
            case 'nameDesc':
                sortOption = { productName: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        // Fetching products with applied filters and sorting
        const products = await productSchema.find(productQuery)
            .sort(sortOption)
            .skip(skip)
            .limit(productsPerPage)
            .populate('category'); // Populate the category field

        // Counting the total number of products matching the query
        const productsCount = await productSchema.countDocuments(productQuery);

        
        res.render('user/home', {
            title: 'Home',
            alertMessage: req.flash('errorMessage'),
            user: req.session.user,
            products,
            categories,
            pageNumber: Math.ceil(productsCount / productsPerPage),
            currentPage,
            totalPages: Math.ceil(productsCount / productsPerPage),
            query: req.query
        });
    } catch (err) {
        console.error(`Error on home render get: ${err}`);
        res.status(500).send('An error occurred');
    }
};


//profileRender
const profileRender = async (req, res) => {
  try {
    const profileDetails = await userSchema.findById(req.session.user)
    res.render('user/profile', {
      title: 'profile',
      alertMessage: req.flash('errorMessage'),
      user: req.session.user,
      profileDetails
    })
  } catch (err) {
    console.log(`Error on user profile render get ${err}`);
  }
}

const editProfile = async (req, res) => {
  try {
    const profileID = req.session.user;

    if (!profileID) {
      req.flash('errorMessage', "Profile id not found");
      return res.redirect('/profile');
    }

    const newUsername = req.body.username.trim().toLowerCase();
    const newPhone = req.body.phone.trim();

    if (!newUsername || !newPhone) {
      req.flash('errorMessage', "Username and phone fields are required");
      return res.redirect('/profile');
    }

    let editedProfile = await userSchema.findByIdAndUpdate(
      profileID,
      {
        $set: {
          name: newUsername,
          phone: newPhone
        },
      },
      { new: true }
    );

    if (editedProfile) {
      req.flash('errorMessage', "Profile edited successfully");
      return res.redirect('/profile');
    }
  } catch (err) {
    console.log("Error on editing profile ", err);
  }
};


const addAddress = async (req, res) => {
  try {
    const profileID = req.session.user;

    if (!profileID) {
      req.flash('errorMessage', "Profile id not found");
      return res.redirect('/profile');
    }

    const newCity = req.body.city.trim();
    const newHomeAddress = req.body.homeAddress.trim();
    const newAreaAddress = req.body.areaAddress.trim();
    const newPincode = req.body.pincode.trim();
    const newState = req.body.state.trim();
    const newLandmark = req.body.landmark.trim();

    if (!newCity || !newAreaAddress || !newHomeAddress || !newPincode || !newState || !newLandmark) {
      req.flash('errorMessage', "All fields are required");
      return res.redirect('/profile');
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
      return res.redirect('/profile')
    }

    userDetails.address.push(addressDetails)

    await userDetails.save()

    req.flash('errorMessage', "Address edited successfully");
    return res.redirect('/profile');

  } catch (err) {
    console.log("Error on editing address on profile ", err);
  }
};

const editAddress = async (req, res) => {
  try {
    const index = req.params.index

    if (!index) {
      req.flash('errorMessage', " user details couldn't find")
      return res.redirect('/profile')
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

    res.redirect('/profile')
  } catch (err) {
    console.log(`error on edit address modal post${err}`)
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



const security = (req, res) => {
  try {
    if (req.session.user) {
      res.render('user/security', {
        title: 'security',
        alertMessage: req.flash('errorMessage'),
      })
    }
  } catch (er) {
    console.log(`error on security page rendering: ${err}`)
  }
}

const newSecurity = async (req, res) => {
  try {

    const userDetails = await userSchema.findById(req.session.user)

    //checking wheather the passwords entered in the body and database matches or not
    const comparePassword = await bcrypt.compare(req.body.password, userDetails.password);

    if (!comparePassword) {
      req.flash('errorMessage', "The password you have entered is not correct")
      return res.redirect('/security')
    }

    //checking new passwords mathc or not
    const newPassword = req.body.newPassword
    const confirmPassword = req.body.confirmPassword

    if (newPassword != confirmPassword) {
      req.flash('errorMessage', "the passwords do not match")
      return res.redirect('/security')
    }

    //hashing the pass to store in db
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    //storung to db
    await userSchema.findByIdAndUpdate(req.session.user, { password: hashedPassword })

    req.flash('errorMessage', "Password changed successfully")
    return res.redirect('/profile')

  } catch (err) {
    console.log(`error on new password adding post: ${err}`)
  }
}

module.exports = {
  homeRender,
  profileRender,
  editProfile,
  addAddress,
  editAddress,
  deleteAddress,
  security,
  newSecurity

}