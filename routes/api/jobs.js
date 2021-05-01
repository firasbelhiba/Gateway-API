const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Job = require("../../models/Job");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const { check , validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const config = require("config");
var request = require('request');
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: config.get("mail_api_key"),
    },
  })
);



//@author Iheb Laribi
//@route POST api/jobs/
//@desc add job
//@access Private
router.post(
    "/",
    [auth, [check('description', 'Text is required ').not().isEmpty(),
    check('price', 'price is required').not().isEmpty(),
    check('availability', 'availability is required').not().isEmpty(),
    check('category', 'category is required').not().isEmpty(),
    check('title', 'title is required').not().isEmpty(),
    
    check('location', 'location is required').not().isEmpty(),
  ]],
    
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
       const { description, price, availability, category, title , updatedAt , candidates, appliedTo ,skills,location} = req.body;
      try {
        const user = await User.findById(req.user.id).select("-password");
  
        const newJob = new Job({
          user: user,
          description,
          price,
          availability,
          category,
          title,
          updatedAt,
          candidates,
          appliedTo,
          location,
          skills 
        });
        const job = await newJob.save();
        res.json(job);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
      }
    }
  );


module.exports = router;
