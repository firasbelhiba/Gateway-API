const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');


const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');


//@route GET api/profile/me
//@desc Get current users profile 
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // If there is no existing profile 
        if (!profile) {
            return res.status(400).json({ message: 'There is no profile for this user ' });
        }

        // If there is a profile 
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

});

//@route POST api/profile
//@desc Create or upddate a user profile 
//@access Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { company, website, location, bio, status, githubusername
        , skills, intrests, youtube, facebook, twitter, linkedin, instagram } = req.body;

    // Build profile object 
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    if (intrests) {
        profileFields.intrests = intrests.split(',').map(intrests => intrests.trim());
    }

    // Build social network object 
    profileFields.social = {};
    if (youtube) profileFields.youtube = youtube;
    if (facebook) profileFields.facebook = facebook;
    if (twitter) profileFields.twitter = twitter;
    if (linkedin) profileFields.linkedin = linkedin;
    if (instagram) profileFields.instagram = instagram;

    try {

        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // If profile already exists than update profile
            profile = await Profile.findOneAndUpdate({ user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }


        // If profile does not exist than create profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }


});


module.exports = router;