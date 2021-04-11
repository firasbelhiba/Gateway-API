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
        urls.push(newPath);
        fs.unlinkSync(path);
      }

      const newPost = new Post({
        user: req.user.id,
        title: req.body.title,
        text: req.body.text,
        image: urls[0].url,
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
    //

    console.log(profile);

    profile.shared.unshift({ post: req.params.id });
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

module.exports = router;
