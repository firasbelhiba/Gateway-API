const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SavedNewsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    list: [
        {
            title: {
                type: String,
            },
            subtitle: {
                type: String,
            },
            link: {
                type: String,
            },
            image: {
                type: String,
            },
            source: {
                type: String,
            },
            time: {
                type: String,
            },
        },
    ]
});

module.exports = SavedNews = mongoose.model("news", SavedNewsSchema);
