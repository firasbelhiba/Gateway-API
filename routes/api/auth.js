const express = require('express');
const router = express.Router();
const config = require('config');
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridtransport = require('nodemailer-sendgrid-transport');



const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

//@author Firas Belhiba
//@Route GET api/auth
// @Description  Finduserbyid from token route 
// @Access Private 
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@author Firas Belhiba
//@Route POST api/auth
// @Description  Authenticate user route 
// @Access Public  
router.post('/', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {

        // See if user already exists 
        let user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({ errors: [{ message: 'Invalid paramaters , try again !' }] });
        }

        const isMatch = await bcrypt.compare(password.toString(), user.password);

        if (!isMatch) {
            res.status(400).json({ errors: [{ message: 'Invalid paramaters , try again !' }] });
        }

        // Return the JWT using jsonwebtoken
        const payload = {
            user: {
                id: user.id,
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user });
        });





    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

});


module.exports = router;
