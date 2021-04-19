const mongoose = require("mongoose");
const fs = require("fs");

const contents = fs.readFileSync("./data/categories.json");

let categories = JSON.parse(contents);

const category = Object.freeze(categories);

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  company: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  intrests: {
    type: [String],
  },
  bio: {
    type: String,
  },
  githubusername: {
    type: String,
  },
  cover_image: {
    type: String,
  },
  follwers: [
    {
      profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "profile",
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
    },
  ],
  following: [
    {
      profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "profile",
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      state: { type: Boolean, default: false },
    },
  ],
  reports: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  block_list: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  ],
  shared: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      title: {
        type: String,
        require: true,
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
        require: true,
      },
      image: {
        type: [String],
        default: null,
      },
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
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
    },
  ],
  saved_post: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      title: {
        type: String,
        require: true,
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
        require: true,
      },
      image: {
        type: [String],
        default: null,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  experience: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  Volunteer: [
    {
      title: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      fieldofstudy: {
        type: String,
        required: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  certification: [
    {
      title: {
        type: String,
        required: true,
      },
      field: {
        type: String,
        required: true,
      },
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
      },
      picture: {
        type: String,
      },
      code: {
        type: String,
      },
    },
  ],

  social: {
    youtube: {
      type: String,
    },
    twitter: {
      type: String,
    },
    facebook: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

Object.assign(ProfileSchema.statics, {
  category,
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
