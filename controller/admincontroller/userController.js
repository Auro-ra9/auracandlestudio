const userSchema = require("../../model/userSchema")
const bcrypt = require('bcrypt')

// Rendering users page
const userRender = async (req, res) => {
   try {
        // Pagination parameters
        const usersPerPage = 8
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * usersPerPage

        // Counting the total number of users
        const usersCount = await userSchema.countDocuments()
        // User search 
        const userSearch = req.query.search || ''
        const userDetails = await userSchema.find({ name: { $regex: userSearch, $options: 'i' } }).sort({ createdAt: -1 }).skip(skip).limit(usersPerPage)

        if (userDetails.length === 0) {
            req.flash('errorMessage', 'No user registration details are available')
        }

        res.render('admin/customers', {
            title: "customers",
            alertMessage: req.flash('errorMessage'),
            userDetails,
            currentPage,
            totalPages: Math.ceil(usersCount / usersPerPage)
        })
    } catch (err) {
        console.log(`Error rendering customers: ${err}`)
        req.flash('errorMessage', 'Error rendering customers')
        res.redirect('/admin/customers')
    }
}

// Block user
const blockUser = async (req, res) => {
    try {
        const userID = req.params.userID
        if (!userID) {
            return res.status(404).json({ message: "User id not found" })
        }

        const blockedUser = await userSchema.findByIdAndUpdate(userID, { isBlocked: true })

        if (blockedUser) {
            return res.status(200).json({ message: "User blocked" })
        } else {
            return res.status(404).json({ message: "User not found" })
        }
    } catch (err) {
        console.log("Error on blocking the user:", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// Unblock user
const unblockUser = async (req, res) => {
    try {
        const userID = req.params.userID
        if (!userID) {
            return res.status(404).json({ message: "User id not found" })
        }

        const unblockedUser = await userSchema.findByIdAndUpdate(userID, { isBlocked: false })

        if (unblockedUser) {
            return res.status(200).json({ message: "User unblocked" })
        } else {
            return res.status(404).json({ message: "User not found" })
        }
    } catch (err) {
        console.log("Error on unblocking the user:", err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    userRender,
    blockUser,
    unblockUser
}
