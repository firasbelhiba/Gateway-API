const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { route } = require("./posts");

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
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

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
//@desc report a post
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
      uri: `https://api.github.com/users/${
        req.params.username
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
//Todo

//@author Firas Belhiba
//@route PUT api/profile/unfollow/:id
//@desc Unfollow a post
//@access Private

//@author Firas Belhiba
//@route GET api/profile
//@desc Get all profiles
//@access Private
router.get("/getmyall", auth, async (req, res) => {
  try {
    const profiles = await Profile.find(
      filter((block_list) => block_list.user.toString() === req.user.id)
    ).populate("user", ["name", "avatar"]);

    res.json(profiles);
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

module.exports = router;
