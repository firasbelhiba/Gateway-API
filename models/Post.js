const mongoose = require("mongoose");
const fs = require("fs");
const Schema = mongoose.Schema;
const categoryData = require("../data/categories.json");

const contents = fs.readFileSync("./data/categories.json");

let categories = JSON.parse(contents);

const category = Object.freeze(categories);

const PostSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  text: {
    type: String,
    require: true,
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  category: {
    type: String,
    enum: Object.values(category),
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      text: {
        type: String,
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  views: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

Object.assign(PostSchema.statics, {
  category,
});

module.exports = Post = mongoose.model("post", PostSchema);
