const express = require("express");
const connectDB = require("./config/db");
const http = require("http");

const Chat = require("./models/Chat");

const socketIo = require("socket.io");
const passport = require("passport");

//Connect Database
connectDB();

const app = express();
const server = http.createServer(app);
var allowedOrigins = "http://localhost:* http://127.0.0.1:*";
var path = "/*"; // you need this if you want to connect to something other than the default socket.io path

var io = socketIo(server, {
  cors: {
    origins: allowedOrigins,
    path: path,
  },
});

app.use(passport.initialize());

app.use(passport.session());

app.get("/", async (req, res) => {
  console.log("API is running");
});

//Init middleware (Body Parser , now it s included with express )
app.use(express.json({ extended: false }));

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: false,            //access-control-allow-credentials:true
  optionSuccessStatus: 200
}

app.use(cors(corsOptions));

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

//video call



const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const { videoToken } = require('./tokens');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(pino);

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.get('/video/token', (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room);
  sendTokenResponse(token, res);

});
app.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room);
  sendTokenResponse(token, res);
});

// Define routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/q_and_a", require("./routes/api/q_and_a"));
app.use("/api/jobs", require("./routes/api/jobs"));
app.use("/api/chat", require("./routes/api/chat"));
app.use("/api/scrape", require("./routes/api/scrape"));

const PORT = process.env.PORT || 5000;

//This is the Chat code

// io.on('connection', (socket) => {
//   /* socket object may be used to send specific messages to the new connected client */
//   console.log('new client connected');
//   socket.emit('connection', "bena");

//   socket.on('message', (data) => {
//     // console.log(
//     //   "this is the message", data.message,
//     //   "and this is the sender id", data.senderId,
//     //   "and this is the recipient id", data.recipientId)

//     const { message, senderId, recipientId } = data;

//     chat = new Chat({
//       message,
//       senderId,
//       recipientId
//     });

//     chat.save();
//     console.log('message registered in db');
//     socket.broadcast.emit('chat-message', chat);
//   })
// });

io.on("connection", (socket) => {
  // socket.emit('chat-message', 'hello world');
  socket.on("send-chat-message", (data) => {
    socket.broadcast.emit("chat-message", data);
    const { message, senderId, recipientId } = data;

    chat = new Chat({
      message,
      senderId,
      recipientId,
    });

    //chat.save();
    console.log("message registered in db");
  });
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = server;
