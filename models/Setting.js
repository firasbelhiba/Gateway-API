const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    domains: [
        {
            category: {
                type: String,
            },
        },
    ],
    score: [
        {
            domain: {
                name: {
                    type: String
                },
                categories: [
                    {
                        type: {
                            type: String,
                        },
                        score: {
                            type: Number
                        },
                    },
                ],
            },
        },
    ],
    block: {
        types: {
            question: {
                type: Date,
                default: Date.now,
            },
            answer: {
                type: Date,
                default: Date.now,
            },
            reply: {
                type: Date,
                default: Date.now,
            },
        },
    }
});

module.exports = Setting = mongoose.model("setting", SettingSchema);
