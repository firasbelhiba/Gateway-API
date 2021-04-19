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
    votes: [
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
