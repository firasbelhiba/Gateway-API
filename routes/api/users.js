const express = require('express');
const config = require('config');
const User = require('../../models/User');



const router = express.Router();

//@Route GET api/users
// @Description  Test route 
// @Access Public 
router.get('/', (req, res) => res.send('ghada ya bena '));


module.exports = router;
