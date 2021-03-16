const express = require('express');
const router = express.Router();
const config = require('config');


const User = require('../../models/User');

//@Route GET api/auth
// @Description  Test route 
// @Access Public 
router.get('/', (req, res) => res.send('Auth route '));

module.exports = router;
