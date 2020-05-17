const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const model = require("./model");
const path = require("path");

const User = model.getModel("user");
const Chat = model.getModel("chat");

const app = express();
//work with express
const server = require('http').Server(app)
const io = require("socket.io")(server);

io.on('connection', function(socket) {
  socket.on('sendmsg', function(data) {
    // console.log(data)
    const {
      from,
      to,
      msg
    } = data;
    const chatid = [from, to].sort().join('_')
    console.log(chatid)
    Chat.create({
      chatid,
      from,
      to,
      content: msg
    }, function(err, doc) {
      io.emit('recvmsg', Object.assign({}, doc._doc))
    })
    // io.emit('recvmsg', data)

  })
  console.log('login')
})

const userRouter = require("./user");
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/user", userRouter);

app.use(function(req,res,next){
  if(req.url.startsWith('/user')||req.url.startsWith('/static')){
    return next();
  }
  console.log("path.resolve('build.index.html')",path.resolve('build/index.html'))
  return res.sendFile(path.resolve('build/index.html'))
})
app.use("/",express.static(path.resolve('build')))
server.listen(443, function() {
  console.log("ok 443");
});