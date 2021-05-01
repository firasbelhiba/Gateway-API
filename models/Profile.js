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
    suggestions_friends: [
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
    hidden_post: [
        {
            post: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "post",
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
            default: "No Youtube link mentionned"
        },
        twitter: {
            type: String,
            default: "No Twitter link mentionned"

        },
        facebook: {
            type: String,
            default: "No Facebook link mentionned"

        },
        linkedin: {
            type: String,
            default: "No Linkedin link mentionned"

        },
        instagram: {
            type: String,
            default: "No Instagram link mentionned"
        },
    },
    views_profile: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
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
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    portfolio: [
        {
            title: {
                type: String,
                require: true,
            },
            description: {
                type: String,
                require: true,
            },
            image: {
                type: [String],
            },
        },
    ],
    notification: [
        {
            message: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    reviews: [
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
            text: {
                type: String,
            },
            rate: {
                type: Number,
                require: true,
            },
            messages: [
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
                    message: {
                        type: String,
                    },
                    date: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            date: {
                type: Date,
                default: Date.now,
            },

        },
    ],
    savedJobs: [
        {
          job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "job",
          },
        },
      ],
    date: {
        type: Date,
        default: Date.now,
    },
});

Object.assign(ProfileSchema.statics, {
    category,
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
