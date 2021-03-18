const express = require('express');
const router = express.Router();
const config = require('config');
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

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
            res.json({ token });
        });





    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

});
module.exports = router;
