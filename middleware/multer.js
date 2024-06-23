const multer = require('multer')
const path = require('path')
const fs = require('fs')

// multer for storing images from input type files

const storage = multer.diskStorage({
    // destination of the file to store is set as ./uploads
    destination: function (req, file, cb) {
        cb(null, `./uploads`)
    },
    // file name of the images stored which is start with date inn milliseconds and a random long numbers and the file name at the end 
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + `-${file.originalname}`)
    }
})


const upload = multer({ storage: storage })

module.exports = upload