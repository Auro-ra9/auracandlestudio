const express = require('express');
const path = require("path");

const testRun = (req, res) => {
    try {
        res.render('admin/testRun',
            {
                title: 'testRun',
                alertMessage:
                    req.flash('errorMessage')
            })
    } catch (err) {
        console.log(`Erron on testing the page: ${err}`)
    }
}


module.exports={
    testRun
}