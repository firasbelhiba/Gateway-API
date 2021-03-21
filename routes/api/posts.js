const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");

//@route POST api/posts/
//@desc add post
//@access Private
router.post(
  "/",
  [auth, [check("text", "Text is required ").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
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

module.exports = router;
