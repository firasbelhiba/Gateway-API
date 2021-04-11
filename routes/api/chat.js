const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const socketIo = require("socket.io");


const server = require('../../server');
const User = require("../../models/User");
const Chat = require("../../models/Chat");

var allowedOrigins = "http://localhost:* http://127.0.0.1:*";
var path = '/*'; // you need this if you want to connect to something other than the default socket.io path

var io = socketIo(server, {
    cors: {
        origins: allowedOrigins,
        path: path,
    }
});


io.on('connection', (socket) => { /* socket object may be used to send specific messages to the new connected client */
    console.log('new client connected from chat');
    socket.emit('connection', "dali");
});



// router.get('/', (req, res) => {

//     io.on('connection', (socket) => { /* socket object may be used to send specific messages to the new connected client */
//         console.log('new client connected from chat');
//         socket.emit('connection', "dali");
//     });
//     res.json("User connected");
// })



// const io = socketio(server);


//@author Firas Belhiba
//@route GET api/chat/send/recipient_id
//@desc 
//@access Public
// router.post('/send/:recipient_id', auth, async (req, res) => {

//     const user = await User.findById(req.user.id).select("-password");

//     const newChat = new Chat({
//         senderId: req.user.id,
//         recipientId: req.params.recipient_id,
//         message: req.body.message,
//     });

//     // let id = req.body.id;
//     // let message = req.body.message;
//     // var data = { id, message }
//     io.emit('firas', newChat);
//     console.log("API is running");
//     res.json(newChat);
// });

module.exports = router;