const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingSchema = new Schema({
    user: {
        type: String,
    },
    domains: [
        {
            category: {
                type: String,
            },
        },
    ]
});

module.exports = Setting = mongoose.model("setting", SettingSchema);
