const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const { LinkedInProfileScraper } = require('linkedin-profile-scraper');

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { route } = require("./posts");
const cloudinary = require("../../utils/cloudinary");
const upload = require("../../middleware/multer");
const fs = require("fs");


const linkedinDataJSON = fs.readFileSync("././data/dataLinkedinProfile.json");

let linkedinData = JSON.parse(linkedinDataJSON);



//@author Firas Belhiba
//@route POST api/profile/linkedin
//@desc Create profile with linkedin
//@access Private
router.post(
  "/linkedin",
  [
    auth,
  ],
  async (req, res) => {

    const user = await User.findById(req.user.id).select("-password");

    const {
      link,
      cookie,
    } = req.body;

    // Build profile object
    const profileFields = {};
    const newExperience = {};
    const newEducation = {};
    const skills = []

    profileFields.user = req.user.id;

    if (linkedinData.userProfile.description === null) {
      profileFields.bio = "No bio specified"
    } else {
      profileFields.bio = linkedinData.userProfile.description;
    }

    if (linkedinData.userProfile.fullName === null) {
      profileFields.name = "No name specified"
    } else {
      profileFields.name = linkedinData.userProfile.fullName;
    }

    profileFields.avatar = linkedinData.userProfile.photo;

    if (linkedinData.userProfile.location.city === null) {
      profileFields.location = "No location specified"
    } else {
      profileFields.location = linkedinData.userProfile.location.city;
    }

    if (linkedinData.userProfile.title === null) {
      profileFields.status = "No status specified"
    } else {
      profileFields.status = linkedinData.userProfile.title;
    }


    for (let i = 0; i < linkedinData.skills.length; i++) {
      skills.push(linkedinData.skills[i].skillName)
      profileFields.skills = skills;
    }



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

      let profile = await Profile.findOne({ user: req.user.id });

      profile = new Profile(profileFields);

      for (let i = 0; i < linkedinData.experiences.length; i++) {
        if (linkedinData.experiences[i].title === null) {
          newExperience.title = "No title specified"
        } else {
          newExperience.title = linkedinData.experiences[i].title;
        }

        if (linkedinData.experiences[i].company === null) {
          newExperience.company = "No company specified"
        } else {
          newExperience.company = linkedinData.experiences[i].company;
        }

        // if (linkedinData.experiences[i].location.country === null) {
        //   newExperience.location = "No location specified"
        // } else {
        //   newExperience.location = linkedinData.experiences[i].location.country;
        // }


        newExperience.from = linkedinData.experiences[i].startDate;
        newExperience.to = linkedinData.experiences[i].endDate;
        newExperience.current = linkedinData.experiences[i].endDateIsPresent;

        if (linkedinData.experiences[i].description === null) {
          newExperience.description = "No description specified"
        } else {

          newExperience.description = linkedinData.experiences[i].description;
        }
        profile.experience.unshift(newExperience)
      }

      for (let i = 0; i < linkedinData.education.length; i++) {
        if (linkedinData.education[i].fieldOfStudy === null) {
          newEducation.fieldofstudy = "No field study specified"
        } else {
          newEducation.fieldofstudy = linkedinData.education[i].fieldOfStudy;
        }

        if (linkedinData.education[i].schoolName === null) {
          newEducation.school = "No school specified"
        } else {
          newEducation.school = linkedinData.education[i].schoolName;
        }


        if (linkedinData.education[i].degreeName === null) {
          newEducation.degree = "No degree specified"
        } else {
          newEducation.degree = linkedinData.education[i].degreeName;
        }

        newEducation.from = linkedinData.education[i].startDate;
        newEducation.to = linkedinData.education[i].endDate;
        profile.education.unshift(newEducation)
      }


      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route GET api/profile/me
//@desc Get current users profile
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    // If there is no existing profile
    if (!profile) {
      return res
        .status(400)
        .json({ message: "There is no profile for this user " });
    }

    // If there is a profile
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route POST api/profile
//@desc Create or upddate a user profile
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id).select("-password");

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      intrests,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.name = user.name;
    profileFields.avatar = user.avatar;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    if (intrests) {
      profileFields.intrests = intrests
        .split(",")
        .map((intrests) => intrests.trim());
    }

    // Build social network object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // If profile already exists than update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
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
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route GET api/profile
//@desc Get all profiles
//@access Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find();

    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route GET api/profile/user/:user_id
//@desc Get profile by user id
//@access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route DELETE api/profile
//@desc Delete profile , user & posts
//@access Private
router.delete("/", auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    // whatever comes later
    res.json({ message: "User deleted with success" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route PUT api/profile/experience
//@desc Add profile experience
//@access Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // unshift it push in the begging rather than the end
      profile.experience.unshift(newExperience);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience from profile
//@access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route Put api/profile/experience/:exp_id
//@desc update experience from profile
//@access Private
router.put(
  "/experience/:exp_id",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //Get index
      const updateIndex = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);

      profile.experience[updateIndex] = newExperience;

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route PUT api/profile/education
//@desc Add profile education
//@access Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // unshift it push in the begging rather than the end
      profile.education.unshift(newEducation);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route DELETE api/profile/education/:edu_id
//@desc Delete an education from profile
//@access Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route Put api/profile/education/:edu_id
//@desc update education from profile
//@access Private
router.put(
  "/education/:edu_id",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //Get index
      const updateIndex = profile.education
        .map((item) => item.id)
        .indexOf(req.params.edu_id);

      profile.education[updateIndex] = newEducation;

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route PUT api/profile/volunteer
//@desc Add a volunteer experience
//@access Private
router.put(
  "/volunteer",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newVolunteer = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      // unshift it push in the begging rather than the end
      // Missclick the volunteer on the model is capital cases
      profile.Volunteer.unshift(newVolunteer);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route DELETE api/profile/volunteer/:Vol_id
//@desc Delete volunteer from profile
//@access Private
router.delete("/volunteer/:Vol_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.Volunteer.map((item) => item.id).indexOf(
      req.params.Vol_id
    );

    // Missclick the volunteer on the model is capital cases
    profile.Volunteer.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route Put api/profile/volunteer/:vol_id
//@desc update volunteer from profile
//@access Private
router.put(
  "/volunteer/:vol_id",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newVolunteer = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //Get index
      const updateIndex = profile.Volunteer.map((item) => item.id).indexOf(
        req.params.vol_id
      );

      profile.Volunteer[updateIndex] = newVolunteer;

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route PUT api/profile/certification
//@desc Add a certification
//@access Private
router.put(
  "/certification",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("field", "Field is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, field, from, to, picture, code } = req.body;

    const newCertification = {
      title,
      field,
      from,
      to,
      picture,
      code,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      console.log("this is the profile  : ", profile);

      // unshift it push in the begging rather than the end
      profile.certification.unshift(newCertification);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);
//@author Firas Belhiba
//@route DELETE api/profile/certification/:cer_id
//@desc Delete certification from profile
//@access Private
router.delete("/certification/:cer_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.certification
      .map((item) => item.id)
      .indexOf(req.params.cer_id);

    profile.certification.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
//@author Firas Belhiba
//@route PUT api/profile/certification/:cer_id
//@desc update certification from profile
//@access Private
router.put(
  "/certification/:cer_id",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("field", "Field is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, field, from, to, picture, code } = req.body;

    const newCertification = {
      title,
      field,
      from,
      to,
      picture,
      code,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //Get index
      const updateIndex = profile.certification
        .map((item) => item.id)
        .indexOf(req.params.cer_id);

      profile.certification[updateIndex] = newCertification;

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route POST api/profile/report/:id
//@desc report a profile
//@access Private
router.post("/report/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: "Post not Found " });
    }

    profile.reports.unshift({ user: req.user.id });

    await profile.save();

    res.json(profile.reports);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route GET api/profile/github/:username
//@desc Get user repos from Github
//@access Public
router.get("/github/:username", async (req, res) => {
  try {
    // This is only to show  repositories , if you want to show more or less just change the per_page parameters in the uri
    const options = {
      uri: `https://api.github.com/users/${req.params.username
        }/repos?per_page=5&sort=created:asc&client_id=${config.get(
          "githubClientId"
        )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route PUT api/profile/follow/:id
//@desc follow a post
//@access Private
router.put("/follow/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const followedProfile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    if (req.params.id === profile.id) {
      return res.status(400).json({ message: "You can't follow yourself !! " });
    }

    //Check if the profile is already followed
    if (
      profile.following.filter(
        (follow) => follow.profile.toString() === req.params.id
      ).length > 0
    ) {
      return res
        .status(400)
        .json({ message: "You already followed this profile!" });
    }

    newFollowing = {};

    newFollowing.profile = req.params.id;
    newFollowing.name = followedProfile.name;
    newFollowing.avatar = followedProfile.avatar;
    newFollowing.state = true;

    newFollower = {};

    newFollower.profile = profile.id;
    newFollower.name = profile.name;
    newFollower.avatar = profile.avatar;

    profile.following.unshift(newFollowing);

    followedProfile.follwers.unshift(newFollower);

    await profile.save();
    await followedProfile.save();

    res.json(profile.following);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Profile not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route PUT api/profile/unfollow/:id
//@desc Unfollow a post
//@access Private
router.put("/unfollow/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const unfollowedProfile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    if (req.params.id === profile.id) {
      return res
        .status(400)
        .json({ message: "You can't unfollow yourself !! " });
    }

    //Check if the profile is already followed
    if (
      profile.following.filter(
        (follow) => follow.profile.toString() === req.params.id
      ).length === 0
    ) {
      return res
        .status(400)
        .json({ message: "You already unfollowed this profile!" });
    }

    //Remove Index
    const removeIndexFollowing = profile.following
      .map((follow) => follow.profile.toString())
      .indexOf(req.param.id);

    const removeIndexFollowers = unfollowedProfile.follwers
      .map((follow) => follow.profile.toString())
      .indexOf(profile.id);

    profile.following.splice(removeIndexFollowing, 1);

    unfollowedProfile.follwers.splice(removeIndexFollowers, 1);

    await profile.save();
    await unfollowedProfile.save();

    res.json(profile.following);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route GET api/profile
//@desc Get all profiles
//@access Private
router.get("/getmyall", auth, async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    const profile = await Profile.findOne({ user: req.user.id });

    const block_list = profile.block_list.filter((block) =>
      block.user.toString()
    );

    console.log(
      "voici la liste",
      block_list.filter(
        (block) => block.user.toString() === profiles[0].user.toString()
      ).length
    );

    for (var i = 0; i < profiles.length; i++) {
      if (
        profile.block_list.filter(
          (block) => block.user.toString() == profiles[i].user
        )
      ) {
        profiles.splice(i, 1);
      }
    }

    res.json(profiles.length);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route PUT api/profile/block/:id
//@desc Block profile
//@access Private
router.put("/block/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const blockedProfile = await Profile.findOne({ user: req.params.id });

    if (!blockedProfile) {
      return res.status(404).json({ message: "Post not Found " });
    }

    //Check if the profile is already blocked by the user
    if (
      profile.block_list.filter(
        (block) => block.user.toString() == blockedProfile.user
      ).length > 0
    ) {
      return res
        .status(400)
        .json({ message: "This user is already blocked !" });
    }

    profile.block_list.unshift({ user: blockedProfile.user });

    await profile.save();

    res.json(profile.block_list);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route DELETE api/profile/block/:id
//@desc Unblock profile
//@access Private
router.delete("/unblock/:id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const blockedProfile = await Profile.findOne({ user: req.params.id });

    if (!blockedProfile) {
      return res.status(404).json({ message: "Post not Found " });
    }

    //Check if the profile is already unblocked by the user
    if (
      profile.block_list.filter(
        (block) => block.user.toString() == blockedProfile.user
      ).length == 0
    ) {
      return res.status(400).json({ message: "This user is not blocked !" });
    }

    //Remove Index
    const removeIndex = profile.block_list
      .map((block) => block.user.toString())
      .indexOf(blockedProfile.user);

    profile.block_list.splice(removeIndex, 1);

    await profile.save();

    res.json(profile.block_list);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route POST api/profile/upload
//@desc update profile picture
//@access private
router.post("/upload", [upload.array("image"), auth], async (req, res) => {
  try {
    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    const urls = [];

    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    userField = {};
    userField.avatar = urls[0].url;
    user = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: userField },
      { new: true }
    ).select("-password");
    profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: userField },
      { new: true }
    );

    res.status(200).json({
      message: "Images Uploaded Succefully",
      data: urls,
      updatedProfile: profile,
    });
  } catch (error) {
    res.status(405).json({
      err: "Images not uploaded succefully",
    });
  }
});

//@author Firas Belhiba
//@route POST api/profile/cover
//@desc update cover picture
//@access private
router.post("/cover", [upload.array("image"), auth], async (req, res) => {
  try {
    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    const urls = [];

    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    profileField = {};
    profileField.cover_image = urls[0].url;

    profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileField },
      { new: true }
    );

    res.status(200).json({
      message: "Images Uploaded Succefully",
      data: urls,
      updatedProfile: profile,
    });
  } catch (error) {
    res.status(405).json({
      err: "Images not uploaded succefully",
    });
  }
});

//@author Firas Belhiba
//@route POST api/profile/portfolio
//@desc add portfolio
//@access private
router.post(
  "/portfolio",
  [
    auth,
    [
      check("title", "Title is required ").not().isEmpty(),
      check("description", "Description is required ").not().isEmpty(),
    ],
    upload.array("image"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const uploader = async (path) => await cloudinary.uploads(path, "Images");

      const urls = [];

      const files = req.files;

      for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path);
        urls.push(newPath);
        fs.unlinkSync(path);
      }

      const { title, description } = req.body;

      const newPortfolio = {
        title: title,
        description: description,
        image: urls[0].url,
      };

      const profile = await Profile.findOne({ user: req.user.id });

      // unshift it push in the begging rather than the end
      profile.portfolio.unshift(newPortfolio);

      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Firas Belhiba
//@route POST api/profile/notification
//@desc Notify me
//@access Private
router.post("/notify-me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.notification.unshift({ message: req.body.message });

    await profile.save();

    res.json(profile.notification);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route POST api/profile/notify-other-user/:id
//@desc Notify other user
//@access Private
router.post("/notify-other-user/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const profile = await Profile.findOne({ user: user._id });

    profile.notification.unshift({ message: req.body.message });

    await profile.save();

    res.json(profile.notification);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Firas Belhiba
//@route PUT api/profile/view/:id
//@desc view a profile
//@access Private
router.put("/view/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const profile = await Profile.findOne({ _id: req.params.id });

    const myProfile = await Profile.findOne({ user: req.user.id });

    console.log(profile);

    //Check if the view is already there
    if (
      profile.views_profile.filter(
        (view) => view.user.toString() === req.user.id
      ).length > 0
    ) {
      return res.status(400).json({ message: "Profile already viewed !" });
    }

    const newView = {
      user: req.user.id,
      profile: myProfile._id,
      name: user.name,
      avatar: user.avatar,
    };

    profile.views_profile.unshift(newView);

    await profile.save();
    res.json(profile.views_profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Profile not Found " });
    }
    res.status(500).send("Server error");
  }
});



//@author Firas Belhiba & Ghada Khedri
//@route GET api/profile/suggestion
//@desc get suggestions
//@access Private
router.get("/suggestion", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await (
      await Profile.findOne({ user: user._id })
    )
    const profiles = await Profile.find();

    // If there is no existing profile
    if (!profile) {
      return res
        .status(400)
        .json({ message: "There is no profile for this user " });
    }

    const newSuggestions = {};

    for (let i = 0; i < profiles.length; i++) {
      if (profile.company === profiles[i].company) {
        newSuggestions.profile = profiles[i].user;
        newSuggestions.name = profiles[i].name;
        newSuggestions.avatar = profiles[i].avatar;
        profile.suggestions_friends.push(newSuggestions)
      }
      if (profile.status === profiles[i].status) {
        newSuggestions.profile = profiles[i].user;
        newSuggestions.name = profiles[i].name;
        newSuggestions.avatar = profiles[i].avatar;
        profile.suggestions_friends.push(newSuggestions)
      }

      for (let j = 0; j < profile.skills.length; j++) {
        for (k = 0; k < profiles[i].skills.length; k++) {
          if (profile.skills[j].toLowerCase() === profiles[i].skills[k].toLowerCase()) {
            newSuggestions.profile = profiles[i].user;
            newSuggestions.name = profiles[i].name;
            newSuggestions.avatar = profiles[i].avatar;
            profile.suggestions_friends.push(newSuggestions)
          }
        }
      }

    }

    let suggestionList = profile.suggestions_friends

    suggestionList = suggestionList.reduce((acc, current) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    suggestionList = suggestionList.filter(function (obj) {
      return obj.name !== profile.name;
    });


    //await profile.save();

    res.json(suggestionList);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});


//@author Firas Belhiba
//@route POST api/profile/review/:id
//@desc add a review
//@access Private
router.post("/review/:id", auth, async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");
    const myProfile = await Profile.findOne({ user: user._id });

    const profile = await Profile.findOne({ _id: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: "Post not Found " });
    }

    const {
      text,
      rate,
    } = req.body;

    const newReview = {};

    newReview.profile = myProfile._id;
    newReview.text = text;
    newReview.rate = rate;

    profile.reviews.unshift(newReview);

    await profile.save();

    res.json(profile.reports);

  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});






module.exports = router;
