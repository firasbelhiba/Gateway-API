const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    message: {
        type: String,
    },
    image: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Chat = mongoose.model('chat', ChatSchema);
