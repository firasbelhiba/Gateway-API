const multer = require('multer');
const express = require('express');
const path = require('path');
const cloudinary = require('../utils/cloudinary');


//specify the storage engine 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, `${file.filename}-${Date.now()}${path.extname(file.originalname)}`)
    }
})


function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Image Only!')
    }
}


const upload = multer({
    storage,
    limits: { fileSize: 200 * 200 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
})


module.exports = upload;






