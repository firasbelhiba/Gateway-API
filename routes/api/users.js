const express = require('express');
const { check, validationResult } = require('express-validator/check');
const config = require('config');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const passport = require('passport');
const { LinkedInProfileScraper } = require('linkedin-profile-scraper');
const fs = require('fs');








require('../../utils/google-passeport-setup');


const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: config.get('mail_api_key')
    }
}));



const User = require('../../models/User');

var newUser = "";



const router = express.Router();

//@author Firas Belhiba
//@Route get api/users/google
// @Description  google auth form 
// @Access Public 
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))


router.get('/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    function (req, res) {
        newUser = { name: req.user.displayName, avatar: req.user.photos[0].value, email: req.user.emails[0].value }
        res.redirect('http://localhost:3000/login-with-google');
    }
);


//@author Firas Belhiba
//@Route get api/users/google
// @Description  Register with google
// @Access Public 
router.post('/register-with-google', async (req, res) => {
    // console.log("this is your profile", { name: req.user.displayName, pic: req.user.photos[0].value, email: req.user.emails[0].value });
    try {
        // Check user if already exist 
        let user = await User.findOne({ email: newUser.email });


        if (user) {
            res.status(400).json({ errors: [{ message: 'User already exists' }] });
        }

        user = new User({
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            password: req.body.password
        });

        // Password encryption
        const salt = await bcrypt.genSalt(saltRounds);

        // I added the toString() otherwise it didn't work thanks to : https://github.com/bradtraversy/nodeauthapp/issues/7
        user.password = await bcrypt.hash(req.body.password.toString(), salt);

        await user.save();

        await transporter.sendMail({
            to: user.email,
            from: "gatewayjustcode@gmail.com",
            subject: "Sign up success",
            html: "<h1>Welcome to Gateway</h1>"
        })

        // Get the token
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000000 }, (err, token) => {
            if (err) throw err;
            res.json({ token , user });
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})


//@author Firas Belhiba
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

        console.log(user.email)

        await transporter.sendMail({
            to: user.email,
            from: "gatewayjustcode@gmail.com",
            subject: "Sign up success",
            html: "<h1>Welcome to Gateway</h1>"
        })

        // Get the token
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user });
        })


    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});



//@author Firas Belhiba
//@Route POST api/users
// @Description  Register with facebook 
// @Access Public 
router.post('/facebook', async (req, res) => {


    const { name, email, password, avatar } = req.body;

    try {

        // Check user if already exist 
        let user = await User.findOne({ email });

        if (user) {
            res.status(400).json({ errors: [{ message: 'User already exists' }] });
        }

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

        user.avatar = avatar;

        await user.save();

        console.log(user.email)

        await transporter.sendMail({
            to: user.email,
            from: "gatewayjustcode@gmail.com",
            subject: "Sign up success",
            html: "<h1>Welcome to Gateway</h1>"
        })

        // Get the token
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000000 }, (err, token) => {
            if (err) throw err;
            res.json({ token , user });
        })


    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//'https://www.linkedin.com/in/ghada-khedri-540351111/'
//AQEDATPI9UsAoS3aAAABd_3dN8gAAAF5JPeMVU4AJCTtlcougs-7X_qGsf2NZx7H1iL5OVVAtJ0z2mxBOx2GqCAs_Ec1Fg_KtSQ_lmug1Qm4_2ldbBhX0WRbAQG83xZaL9BE_YXCEiCt9VF6DmaXcuWy
//@author Firas Belhiba
//@Route POST api/users/linkedin
// @Description  Register with linkedin 
// @Access Public
router.post('/linkedin', async (req, res) => {

    const { email, password, link, cookie } = req.body;

    try {
        console.log('scrapper is executing');

        const scraper = new LinkedInProfileScraper({
            sessionCookieValue: cookie,
            keepAlive: false,
            timeout: 0
        });

        console.log('Setup is exucting');


        await scraper.setup();


        console.log('Result is exucting');

        const result = await scraper.run(link, {
            waitUntil: 'load',
            timeout: 0
        });
        console.log(result)

        let data = JSON.stringify(result)
        fs.writeFileSync('data/dataLinkedinProfile.json', data);

        const linkedinDataJSON = fs.readFileSync("././data/dataLinkedinProfile.json");

        let linkedinData = JSON.parse(linkedinDataJSON);

        // Check user if already exist 
        let user = await User.findOne({ email });

        if (user) {
            res.status(400).json({ errors: [{ message: 'User already exists' }] });
        }

        // This doesn't create the user it just create an inctance of it (we have to implement the .save();)
        user = new User();
        const profileFields = {};

        // Password encryption
        const salt = await bcrypt.genSalt(saltRounds);

        // I added the toString() otherwise it didn't work thanks to : https://github.com/bradtraversy/nodeauthapp/issues/7
        user.password = await bcrypt.hash(password.toString(), salt);

        user.email = email;

        user.name = linkedinData.userProfile.fullName;

        user.avatar = linkedinData.userProfile.photo;

        await user.save();

        await transporter.sendMail({
            to: user.email,
            from: "gatewayjustcode@gmail.com",
            subject: "Sign up success",
            html: "<h1>Welcome to Gateway</h1>"
        })

        // Get the token
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000000 }, (err, token) => {
            if (err) throw err;
            res.json({ token , user});
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

//@author Iheb Laribi
//@route GET api/users/:id
//@desc Get by id job
//@access Public

router.get("/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.json(user);
      if (!user) {
        return res.status(404).json({ message: "user not Found " });
      }
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "user not Found " });
      }
      res.status(500).send("Server error");
    }
  });






module.exports = router;
