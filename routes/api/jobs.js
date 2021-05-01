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
 
//@author Iheb Laribi
//@Route GET api/jobs
// @Description  Test route 
// @Access Public 
router.get("/", async (req, res) => {
    try {
      const jobs = await Job.find().sort({ date: -1 });
      res.json(jobs);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  });  

//@author Iheb Laribi
//@route GET api/jobs/:id
//@desc Get by id job
//@access Public

router.get("/:id", async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      res.json(job);
      if (!job) {
        return res.status(404).json({ message: "Job not Found " });
      }
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Job not Found " });
      }
      res.status(500).send("Server error");
    }
  });  
 
 //@author iHEB Laribi
//@route DELETE api/jobs/:id
//@desc DELETE by id job
//@access Private

router.delete("/:id", auth, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
  
      //Check if the user owns the post
      if (job.user.toString() !== req.user.id) {
        return res
          .status(404)
          .json({ message: "You are not authorized to delete this job " });
      }
      await job.remove();
      res.json({ message: "Job Deleted" });
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Job not Found " });
      }
      res.status(500).send("Server error");
    }
  });
  
  //@author Iheb Laribi
//@route UPDATE api/jobs/:id
//@desc update a job
//@access Private
router.put(
    "/:id",
    [auth, [check('description', 'Text is required ').not().isEmpty(),
    check('price', 'price is required').not().isEmpty(),
    check('availability', 'availability is required').not().isEmpty(),
    check('category', 'category is required').not().isEmpty(),
    check('title', 'title is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
    check('location', 'location is required').not().isEmpty(),
  ]],
    
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
       const { description, price, availability, category, title , updatedAt , candidates, appliedTo, skills ,location} = req.body;
      try {
        const user = await User.findById(req.user.id).select("-password");
        
        const newJob = new Job({
          _id : req.params.id,
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
          skills : skills
        });
  
        let job = await Job.findOne({ _id: req.params.id });
  
        if (!job) {
          return res.status(404).json({ message: "job not Found " });
        }
  
        
          job = await Job.findOneAndUpdate(
            { _id: req.params.id },
            { $set: newJob },
            { new: true }
          );
          res.json(job);
        
        
      } catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
          return res.status(404).json({ message: "Job not Found " });
        }
        res.status(500).send("Server error");
      }
    }
  );
 
  //@author Iheb Laribi
//@route PUT api/jobs/like/:id
//@desc Like a job
//@access Private
router.put("/like/:id", auth, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      
      const jobIds = job.likes.map((like) => like.user.toString());
      const removeIndex = jobIds.indexOf(req.user.id);
  
      //Check if the job is already liked by the user
      if (removeIndex !== -1) {
         
        job.likes.splice(removeIndex, 1); 
         
      }else{
          job.likes.unshift({ user: req.user.id });
        }
        await job.save();
        res.json(job.likes);
      }catch (error) {
          console.error(error.message);
          if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "job not Found " });
          }
          res.status(500).send("Server error");
        
      }
     
  });

  //@author Iheb Laribi
//@route Put api/jobs/comment/:id
//@desc comment a job
//@access Private
router.put(
    "/comment/:id",
    [auth, [check("text", "Text must be required ").not().isEmpty()]],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const job = await Job.findById(req.params.id);
        const user = await User.findById(req.user.id).select("-password");
        const newComment = {
          user: req.body.user,
          text: req.body.text,
          
        };
  
        job.comments.unshift(newComment);
  
        await job.save();
        res.json(job.comments);
      } catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
          return res.status(404).json({ message: "job not Found " });
        }
        res.status(500).send("Server error");
      }
    }
  );


module.exports = router;
