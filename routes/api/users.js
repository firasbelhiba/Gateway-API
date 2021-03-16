const express = require('express');
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');



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

    const { name, email, password } = req.body;

    try {

        // Check user if already exist 
        let user = await User.findOne({ email });

        if (user) {
            res.status(400).json({ errors: [{ message: 'User already exists' }] });
        }

        // Get user avatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        // This doesn't create the user it just create an inctance of it (we have to implement the .save();)
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Password encryption
        const salt = await bcrypt.genSalt(saltRounds);

        // I added the toString() otherwise it didn't work thanks to : https://github.com/bradtraversy/nodeauthapp/issues/7
        user.password = await bcrypt.hash(password.toString(), salt);

        await user.save();





    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});




module.exports = router;
