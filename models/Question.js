const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    subject: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    tags: [
        {
            type: String,
            require: true,
        },
    ],
    upVotes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
        },
    ],
    downVotes: [
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
    solved: {
        type: Boolean,
        default: false,
    },
    reports: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
            reason: {
                type: String,
            },
        },
    ],
    answers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
            description: {
                type: String,
            },
            date: {
                type: Date,
                default: Date.now,
            },
            solution: {
                type: Boolean,
                default: false,
            },
            reports: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "user",
                    },
                    reason: {
                        type: String,
                    },
                },
            ],
            replies: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "user",
                    },
                    description: {
                        type: String,
                    },
                    date: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
    ],
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = Question = mongoose.model("question", QuestionSchema);
