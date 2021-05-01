const mongoose = require("mongoose");
const fs = require("fs");
const Schema = mongoose.Schema;
const categoryData = require("../data/categories.json");

const contents = fs.readFileSync("./data/categories.json");

let categories = JSON.parse(contents);

const category = Object.freeze(categories);

const JobSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  title: {
    type: String,
   },

  availability: {
    type: String,
  },

  category: {
    type: String,
    enum: Object.values(category),
  },

  description: {
    type: String,
    require: true,
  },

  price: {
    type: Number,
  },

  location: {
    type: String,
    require: true,
  },
  
  skills: {
    type: [String],
    
  },

  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  reports: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      reason: {
        type: String,
        require: true,
      },
      date: {
        type: Date,
        default: Date.now,
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
        require: true,
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
  candidates: [
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

  updatedAt: {
    type: Date, default: Date.now
  },
  
  appliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

});


Object.assign(JobSchema.statics, {
  category,
});

module.exports = Job = mongoose.model("job", JobSchema);