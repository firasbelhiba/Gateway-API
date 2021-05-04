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
