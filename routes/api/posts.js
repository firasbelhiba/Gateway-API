const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
const upload = require("../../middleware/multer");
const fs = require("fs");
const cloudinary = require("../../utils/cloudinary");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const config = require("config");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: config.get("mail_api_key"),
    },
  })
);

//@author Ghada Khedri
//@route POST api/posts/
//@desc add post
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required ").not().isEmpty(),
      check("title", "title is required ").not().isEmpty(),
      check("category", "category is required ").not().isEmpty(),
    ],
    upload.array("image"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");

      const uploader = async (path) => await cloudinary.uploads(path, "Images");
      const urls = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path);
        urls.push(newPath.url);

        fs.unlinkSync(path);
      }

      const newPost = new Post({
        user: req.user.id,
        title: req.body.title,
        text: req.body.text,
        image: urls,
        avatar: user.avatar,
        name: user.name,
        category: req.body.category,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

//@author Ghada Khedri
//@route GET api/posts/
//@desc Get all post
//@access Public

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route GET api/posts/:id
//@desc Get by id post
//@access Public

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.json(post);
    if (!post) {
      return res.status(404).json({ message: "Post not Found " });
    }
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route DELETE api/posts/:id
//@desc DELETE by id post
//@access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the user owns the post
    if (post.user.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "You are not authorized to delete this post " });
    }
    await post.remove();
    res.json({ message: "Post Deleted" });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route PUT api/posts/like/:id
//@desc Like a post
//@access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post is already liked by the user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ message: "Post already liked !" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route PUT api/posts/unlike/:id
//@desc Unlike a post
//@access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post is already liked by the user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ message: "Post not liked !" });
    }

    //Remove Index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route POST api/posts/comment/:id
//@desc comment a post
//@access Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text must be required ").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Post not Found " });
      }
      res.status(500).send("Server error");
    }
  }
);

//@author Ghada Khedri
//@route DELETE api/posts/comment/:id/:id_com
//@desc delete a comment
//@access Private
router.delete("/comment/:id/:id_com", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = await post.comments.find(
      (comment) => comment.id === req.params.id_com
    );

    //Check if the comment exists
    if (!comment) {
      return res.status(400).json({ message: "Comment does not exists " });
    }

    //Check if user the owner of the comment
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this post " });
    }

    //Get index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route UPDATE api/posts/:id
//@desc update a post
//@access Private
router.put(
  "/:id",
  [
    auth,
    [
      check("text", "Text is required").not().isEmpty(),
      check("title", "Title is required").not().isEmpty(),
      check("category", "category is required ").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = {
        user: req.user.id,
        title: req.body.title,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        category: req.body.category,
      };

      let post = await Post.findOne({ _id: req.params.id });

      if (!post) {
        return res.status(404).json({ message: "Post not Found " });
      }

      if (post) {
        post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $set: newPost },
          { new: true }
        );
        return res.json(post);
      }
      await post.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Post not Found " });
      }
      res.status(500).send("Server error");
    }
  }
);

//@author Ghada Khedri
//@route UPDATE api/posts/comment/:id/:id_com
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
      const post = await Post.findOne({ _id: req.params.id });
      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      };

      //Get index
      const updateIndex = post.comments
        .map((item) => item.id)
        .indexOf(req.params.id_com);

      post.comments[updateIndex] = newComment;
      await post.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Post not Found " });
      }
      res.status(500).send("Server error");
    }
  }
);

//@author Ghada Khedri
//@route POST api/posts/report/:id
//@desc report a post
//@access Private
router.post("/report/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    if (!post) {
      return res.status(404).json({ message: "Post not Found " });
    }

    post.reports.unshift({ user: req.user.id, reason: req.body.reason });
    await post.save();
    res.json(post.reports);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route PUT api/posts/shared/:id
//@desc share a post
//@access Private
router.put("/shared/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    const user = await User.findById(req.user.id).select("-password");
    const profile = await Profile.findOne({ user: user._id });
    if (!post) {
      return res.status(404).json({ message: "Post not Found " });
    }
    const newShare = {
      post: req.params.id,
      user: req.user.id,
      title: post.title,
      text: post.text,
      avatar: post.avatar,
      name: post.name,
      category: post.category,
      image: post.image,
      likes: post.likes,
      views: post.views,
      comments: post.comments,
    };
    profile.shared.unshift(newShare);
    await profile.save();
    res.json(profile.shared);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route DELETE api/posts/shared/:id/:id_share
//@desc delete a share for a specific post
//@access Private
router.delete("/shared/:id/:id_share", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await Profile.findOne({ user: user._id });
    const post = await Post.findById(req.params.id);
    const share = await profile.shared.find(
      (share) => share.id === req.params.id_share
    );

    //Check if the share exists
    if (!share) {
      return res.status(400).json({ message: "Share does not exists " });
    }

    //Check if user the owner of the share
    if (share.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this post " });
    }

    //Get index
    const removeIndex = profile.shared
      .map((share) => share.user.toString())
      .indexOf(req.user.id);

    profile.shared.splice(removeIndex, 1);
    await profile.save();
    res.json(profile.shared);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route PUT api/posts/view/:id
//@desc view a post
//@access Private
router.put("/view/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the view is already there
    if (
      post.views.filter((view) => view.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ message: "Post already viewed !" });
    }

    post.views.unshift({ user: req.user.id });
    await post.save();
    res.json(post.views);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route POST api/posts/mail/:id
//@desc send a post by email
//@access Private
router.post("/mail/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user.id).select("-password");
    if (!post) {
      return res.status(404).json({ message: "Post not Found " });
    }

    await transporter.sendMail({
      to: req.body.email,
      from: "gatewayjustcode@gmail.com",
      subject: post.title,
      html: `<h1> This post is sent by : ${user.name}</h1>
      <p>${req.body.message}</p>
      <p>${post.text}</p>
      <img src=${post.image} alt=""/>      `,
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

//@author Ghada Khedri
//@route PUT api/posts/save/:id
//@desc save post
//@access Private
router.put("/save/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    const user = await User.findById(req.user.id).select("-password");
    const profile = await Profile.findOne({ user: user._id });

    if (!post) {
      return res.status(404).json({ message: "Post not Found " });
    }

    //Check if the post is already saved by the user
    if (
      profile.saved_post.filter((p) => p.post.toString() === req.params.id)
        .length > 0
    ) {
      return res.status(400).json({ message: "Post already saved !" });
    }

    const newSave = {
      post: req.params.id,
      user: req.user.id,
      title: post.title,
      text: post.text,
      name: post.name,
      avatar: post.avatar,
      category: post.category,
      image: post.image,
    };

    profile.saved_post.unshift(newSave);
    await profile.save();

    res.json(profile.saved_post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route PUT api/posts/hide/:id
//@desc hide post
//@access Private
router.put("/hide/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    const user = await User.findById(req.user.id).select("-password");
    const profile = await Profile.findOne({ user: user._id });

    if (!post) {
      return res.status(404).json({ message: "Post not Found " });
    }

    //Check if the post is already hidden by the user
    if (
      profile.hidden_post.filter((p) => p.post.toString() === req.params.id)
        .length > 0
    ) {
      return res.status(400).json({ message: "Post already hidden !" });
    }

    const newHide = {
      post: req.params.id,
    };

    profile.hidden_post.unshift(newHide);
    await profile.save();

    res.json(profile.hidden_post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Ghada Khedri
//@route DELETE api/posts/unhide/:id
//@desc Unhide a post
//@access Private
router.delete("/unhide/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await Profile.findOne({ user: user._id });

    //Get index
    const removeIndex = profile.hidden_post
      .map((hide) => hide.post.toString())
      .indexOf(req.params.id);

    profile.hidden_post.splice(removeIndex, 1);
    await profile.save();

    res.json(profile.hidden_post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;
