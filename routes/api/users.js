const express = require('express');
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const User = require('../../models/User');



const router = express.Router();

//@Route GET api/users
// @Description  Test route 
// @Access Public 
//router.get('/', (req, res) => res.send('Users route '));


//@Route POST api/users
// @Description  Register route 
// @Access Public 
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid name').isEmail(),
    check('password', 'Please enter a password with at least 6 characters').isLength({
        min: 6
    })
], async (req, res) => {

    // Check inputs validation 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.send('User is valid ');
});




module.exports = router;
