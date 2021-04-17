const express = require('express');
const router = express.Router();
const config = require('config');
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const saltRounds = 10;


const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: config.get('mail_api_key')
    }
}));




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

//@author Firas Belhiba
//@Route POST api/auth/reset-password
// @Description  Reset your password route 
// @Access Public
router.post('/reset-password',
    [
        check('email', 'Please enter a valid email').isEmail()
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email } = req.body;

        try {
            //hex for hexadecimal
            const token = crypto.randomBytes(32).toString("hex");

            let user = await User.findOne({ email });

            if (!user) {
                res.status(400).json({ errors: [{ message: 'Invalid paramaters , try again !' }] });
            }

            user.resetToken = token;
            // token is available for only one hour 
            user.expireToken = Date.now() + 3600000

            await user.save();
            transporter.sendMail({
                to: user.email,
                from: "gatewayjustcode@gmail.com",
                subject: "Did you forget your password ?",
                html:
                    `
                <p>You requested for password reset</p>
                <h5>click in this 
                <a href="http://localhost:3000/reset-password?id=${token}">
                link
                </a> to reset your password
                </h5>
                `
            });

            res.json({ message: "Email sent succefully ! Go check your email !" });


        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }

    })


//@author Firas Belhiba
//@Route POST api/auth/new-password
// @Description  New password route 
// @Access Public
router.post('/new-password',
    [
        check('password', 'Please enter a password with at least 6 characters').isLength({
            min: 6
        })
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {

            const newPassword = req.body.password
            const sentToken = req.body.token

            let user = await User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } });

            if (!user) {
                res.status(400).
                    json({
                        errors:
                            [{ message: 'Session has been expired , please resend another Forget your password email' }]
                    });
            };


            // Password encryption
            const salt = await bcrypt.genSalt(saltRounds);

            // I added the toString() otherwise it didn't work thanks to : https://github.com/bradtraversy/nodeauthapp/issues/7
            user.password = await bcrypt.hash(newPassword.toString(), salt);

            user.resetToken = undefined;
            user.expireToken = undefined;

            await user.save();

            res.json({ message: "password updated succefully" });


        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }

    });


module.exports = router;
