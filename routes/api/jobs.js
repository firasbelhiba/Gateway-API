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
    check('skills', 'Skills is required').not().isEmpty(),
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
          user: req.user.id,
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
          user: req.user.id,
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
 
 //@author Iheb Laribi
//@route Put api/jobs/report/:id
//@desc report a job
//@access Private
router.put(
    "/report/:id",
    [auth, [check("reason", "reason must be required ").not().isEmpty()]],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const job = await Job.findById(req.params.id);
        const user = await User.findById(req.user.id).select("-password");
        const newReport = {
          user: req.body.user,
          reason: req.body.reason,
          
        };
  
        job.reports.unshift(newReport);
  
        await job.save();
        res.json(job.reports);
      } catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
          return res.status(404).json({ message: "job not Found " });
        }
        res.status(500).send("Server error");
      }
    }
  );
 //@author Iheb Laribi
//@route DELETE api/jobs/comment/delete/:id/:id_com
//@desc delete a comment
//@access Private
router.put("/comment/delete/:id/:id_com", auth, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      
      const jobIds = job.comments.map((comment) => comment._id);
      const removeIndex = jobIds.indexOf(req.params.id_com);
  
      //Check if the job is already liked by the user
      if (removeIndex !== -1) {
         
        job.comments.splice(removeIndex, 1); 
        await job.save();
        res.json(job.comments);
         
      }
        
      }catch (error) {
          console.error(error.message);
          if (error.kind === "ObjectId") {
            return res.status(404).json({ message: "job not Found " });
          }
          res.status(500).send("Server error");
        
      }
  });

//@author Iheb Laribi
//@route UPDATE api/jobs/comment/:id/:id_com
//@desc update a comment
//@access Private
router.put(
  "/comment/:id/:id_com",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const job = await Job.findOne({ _id: req.params.id });
      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        user: user,
        text: req.body.text,
      };

      //Get index
      const updateIndex = job.comments
        .map((item) => item.id)
        .indexOf(req.params.id_com);

        job.comments[updateIndex] = newComment;
      await job.save();
      res.json(job);
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "job not Found " });
      }
      res.status(500).send("Server error");
    }
  }
);

//@author Iheb Laribi
//@route put api/jobs/candidat/:id
//@desc application form for a job
//@access Private
router.put("/candidat/:id", auth, async (req, res) => {
    try {
      const job = await Job.findOne({ _id: req.params.id });
  
      if (!job) {
        
        return res.status(404).json({ message: "job not Found " });
      }
      const jobIds = job.candidates.map((candidate) => candidate.user.toString());
      const removeIndex = jobIds.indexOf(req.user.id);
  
      //Check if the job is already liked by the user
      if (removeIndex === -1) {
         
         job.candidates.unshift({ user: req.user.id });
         await job.save();
         res.json(job.candidates);}
         else{
          return res.status(404).json({ message: "la candidature déja fait " });
         }
  
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "job not Found " });
      }
      res.status(500).send("Server error");
    }
  });

//@author Iheb Laribi
//@route put api/jobs/views/:id
//@desc view a job
//@access Private
router.put("/views/:id", auth, async (req, res) => {
    try {
      const job = await Job.findOne({ _id: req.params.id });
  
      if (!job) {
        
        return res.status(404).json({ message: "Post not Found " });
      }
  
      job.views.unshift({ user: req.user.id });
      await job.save();
      res.json(job.views);
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "job not Found " });
      }
      res.status(500).send("Server error");
    }
  });  

 //@author Iheb Laribi
//@route Put api/jobs/applied/:id
//@desc view a job
//@access Private
router.put("/applied/:id", auth, async (req, res) => {
    try {
      let job = await Job.findOne({ _id: req.params.id });
      const user = await User.findById(req.user.id).select("-password");
      const newapplied = {
        appliedTo: user,
  
      };
      if (!job) {
        
        return res.status(404).json({ message: "Post not Found " });
      }
      if ( job.appliedTo !== undefined ) {
        
        return res.status(404).json({ message: "already token " });
      }
  
       job = await Job.findOneAndUpdate(
        { _id: req.params.id },
        { $set: newapplied },
        { new: false }
      );
      await job.save();
      res.json(job.appliedTo);
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "job not Found " });
      }
      res.status(500).send("Server error");
    }
  });
 
  //@author Iheb Laribi
//@route Put api/jobs/save/:id
//@desc save a job
//@access Private
router.put(
    "/saved/:id",auth ,async (req, res) => {
      
      try {
        const job = await Job.findById(req.params.id);
        let profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.savedJobs
          .map((savedJob) => savedJob.job)
          .indexOf(req.params.id);
          const newJob = {
            job: job,   
          };
  
        if (
          removeIndex !== -1
        ) {
             
          profile.savedJobs.splice(removeIndex, 1);
              
    
              
        }else{
  
          profile.savedJobs.unshift(newJob);
        }
    
        //Remove Index
        
          await profile.save();
          res.json(profile.savedJobs);
       
       
      } catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
          return res.status(404).json({ message: "job not Found " });
        }
        res.status(500).send("Server error");
      }
    }
  );

 //@author Iheb Laribi
//@route Put api/jobs/savedSearch/:id
//@desc search save a job
//@access Private
router.get(
    "/savedSearch/:id",auth ,async (req, res) => {
      
      try {
        
        let profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.savedJobs
          .map((savedJob) => savedJob.job)
          .indexOf(req.params.id);
         
  
        if (
          removeIndex !== -1
        ) {     
            return res.json(true) 
        }else{
                
          return res.json(false) 
               
        }   
      } catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
          return res.status(404).json({ message: "job not Found " });
        }
        res.status(500).send("Server error");
      }
    }
  );
  
  //@author Iheb Laribi
//@route Put api/jobs/candidateSearch/:id
//@desc search apply a job
//@access Private
router.get(
    "/candidateSearch/:id",auth ,async (req, res) => {
      
      try {
        
        const job = await Job.findOne({ _id: req.params.id });
  
      if (!job) {
        
        return res.status(404).json({ message: "job not Found " });
      }
      const jobIds = job.candidates.map((candidate) => candidate.user.toString());
      const removeIndex = jobIds.indexOf(req.user.id);
  
      //Check if the job is already liked by the user
      if (removeIndex === -1) {
         
         res.json(false)}
         else{
          res.json(true)
      } 
    }catch (error) {
        console.error(error.message);
        if (error.kind === "ObjectId") {
          return res.status(404).json({ message: "job not Found " });
        }
        res.status(500).send("Server error");
      }
    }
  );

  //@author Iheb Laribi
//@Route GET api/jobs/topjobs
// @Description  Test route 
// @Access public 
router.get("/top/jobs", async (req, res) => {
    try {
      const total= await Job.aggregate([{ $project:{ _id :"$_id", totalLikes:{$size:["$likes"]},totalComments:{$size:["$comments"]},totalViews:{$size:["$views"]},totalreports:{$size:["$reports"]}}},{ $match : { totalLikes:{"$gte": 1}}},{ $sort:{ totalLikes:-1}},{ $limit : 5}]);
      
      res.json(total);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  });

 //@author Iheb Laribi
//@Route GET api/jobs/MostViewed
// @Description  Test route 
// @Access public 
router.get("/Most/Viewed", async (req, res) => {
    try {
      const total= await Job.aggregate([{ $project:{ _id :"$_id", totalLikes:{$size:["$likes"]},totalComments:{$size:["$comments"]},totalViews:{$size:["$views"]},totalreports:{$size:["$reports"]}}},{ $match : { totalViews:{"$gte": 1}}},{ $sort:{ totalViews:-1}},{ $limit : 5}]);
      
      res.json(total);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  });
  
 //@author Iheb Laribi
//@Route GET api/jobs/jobsDetails
// @Description  Test route 
// @Access public 
router.get("/Details/jobs/:id", async (req, res) => {
    try {
     
    const  total= await Job.aggregate([{ $match : { _id : ObjectId(`${req.params.id}`) } },{ $project:{   totalLikes:{$size:["$likes"]},totalComments:{$size:["$comments"]},totalViews:{$size:["$views"]},totalreports:{$size:["$reports"]},totalcandidates:{$size:["$candidates"]}}}])
     res.json(total[0]);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  });
  
  //@author Iheb Laribi
//@Route GET api/jobs/candidates/Details
// @Description  Test route 
// @Access public 
router.get("/Details/candidates/:id", async (req, res) => {
    try {
     
    const  total= await Profile.aggregate([{ $match : { _id : ObjectId(`${req.params.id}`) } },{ $project:{   totalSavedJobs:{$size:["$savedJobs"]}}}])
     res.json(total);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  });

 //@author Iheb Laribi
//@route POST api/posts/mail/:id
//@desc send a post by email
//@access Private
router.post("/mail/:id", auth, async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      const user = await User.findById(req.user.id).select("-password");
      if (!job) {
        return res.status(404).json({ message: "Post not Found " });
      }
  
      
  
      await transporter.sendMail({
        to: req.body.to,
        from: "gatewayjustcode@gmail.com",
        subject: req.body.subject ,
        html: `<h1> sent by : ${user.name}</h1>
        <h1> about your job posted at :${job.date} </h1>
        <h1>title:${job.title}</h1>
        <p>${req.body.message}</p>`,
         
      });
  
      res.status(200).json({ message: "email sent with success !!" });
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Post not Found " });
      }
      res.status(500).send("Server error");
    }
  });

   //@author Iheb Laribi
//@route POST api/posts/interview/:id
//@desc send a post by email
//@access Private
router.post("/interview/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const user = await User.findById(req.user.id).select("-password");
    if (!job) {
      return res.status(404).json({ message: "Post not Found " });
    }

    

    await transporter.sendMail({
      to: [req.body.to,user.email],
      from: "gatewayjustcode@gmail.com",
      subject: req.body.subject ,
      html: `<h1> Interview scheduled:</h1>
      <h1> for the job posted at :${job.date} </h1>
      <h1>title:${job.title}</h1>
      <h2> Date : ${req.body.date}</p> 
      <h2> Room number :${req.body.room}</h2>`,
       
    });

    res.status(200).json({ message: "email sent with success !!" });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});
  
  router.post('/schedule', async (req, res) => {
    transporter.sendMail(options, (err, info) => {
      try {
        const job = schedule.scheduleJob(
          ' 3    *    *    *    * ',
          function () {
            transporter.sendMail(options, (err, info) => {
              if (err) throw new Error(err)
            })
          }
        )
        res.json({ msg: 'mail planed' })
      } catch (error) {
        res.status(500).json(err)
      }
    })
  });
 
  //@author Iheb Laribi
//@route GET api/jobs/see/me
//@desc Get current users jobs
//@access Private
router.get("/see/me", auth, async (req, res) => {
    try {
      const job = await Job.find({
        user: req.user.id,
      }).populate("user", ["name", "avatar"]);
  
      // If there is no existing job
      if (!job) {
        return res
          .status(400)
          .json({ message: "There is no job for this user " });
      }
  
      // If there is a job
      res.json(job);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  });

  router.get("/category/cat", auth, async (req, res) => {
    request({
      uri: 'https://opentdb.com/api_category.php',
      
      
    }).pipe(res);;
  });
  
  router.get("/quiz/:quizNumber/:id/:difficulty", auth, async (req, res) => {
    request({
      uri: 'https://opentdb.com/api.php',
      qs: {
        amount: req.params.quizNumber,
        category: req.params.id,
        difficulty:req.params.difficulty
      }
    }).pipe(res);
  });

  // news category
  router.get("/category/news", auth, async (req, res) => {
    request({
      uri: 'https://newsapi.org/v2/sources?',
      qs: {
        language: "en",
        apiKey: config.get("REACT_NEWS_API_KEY"),
        
      }
      
      
    }).pipe(res);;
  });

  // news category
  router.get("/articles/news/:id", auth, async (req, res) => {
    request({
      uri: 'https://newsapi.org/v2/top-headlines?',
      qs: {
        sources: req.params.id,
        apiKey: config.get("REACT_NEWS_API_KEY"),
        
      }
      
      
    }).pipe(res);;
  });
   
   
  

module.exports = router;
