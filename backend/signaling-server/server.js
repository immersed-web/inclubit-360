const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io");
const util = require("util");
const _ = require("lodash");
const ip = require("ip");

let PORT = 3000;
if (process.env.PORT) {
  PORT = process.env.PORT;
}

console.log("Startar fdlis signaling server!");
console.log();
console.log(`If running this server locally set the following env vars to be used by frontend:`);
console.log(`SIGNALING_SERVER=http://${ip.address() + ':' + PORT}/`);
console.log();

let config = {}
if(process.env.DEVELOPMENT){
  console.log('RUNNING SIGNALING SERVER IN DEVELOPMENT MODE');
  console.log('settting cors for localhost:8080');
  config['cors'] = {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  }
}

/** @type {socketio.Server} */
const io = socketio(http, config);

app.get("/", function (req, res) {
  res.send("Gunnars episka websocket server för att hantera videosamtal!!!!");
});

//we call this function immediately.
// (() => {
//   console.log("promisifying io (socket.io instance) functions");
//   // util.promisify(io.on);
// })();

async function getRoomMembers(roomName){
  const socketArray = await io.sockets.in(roomName).fetchSockets();
  return socketArray.map(socket => {
    return {
      id: socket.id,
      data: socket.data,
    }
  })

  // console.log('getting members in room: ', roomName);
  // if (!io.sockets.adapter.rooms[roomName]){
  //   return undefined;
  // } 
  // const socketIds = Object.keys(io.sockets.adapter.rooms[roomName].sockets);
  // // console.log('socketIds :>> ', socketIds);
  // const socketArray = Object.entries(io.sockets.connected);
  // // console.log('socketArray :>> ', socketArray);
  // const filteredSockets = socketArray.filter(([id, socket])=> {
  //   return socketIds.includes(id);
  // })
  // // console.log('filteredSockets :>> ', filteredSockets);
  // const roomContent = filteredSockets.map(([id, socket]) => {
  //   console.log(id);
  //   return {
  //     id: id,
  //     data: socket.meta
  //     // extraData: value.extraData,
  //     // username: value.username,
  //     // sender: value.sender
  //   }
  // });
  // console.log('got room members: ', roomContent);
  // return roomContent;
  // // return members;
}

io.on("connection", function (socket) {
  console.log("socket connection established. id: " + socket.id);
  // if this socket is already logged in,
  // send a failed login message
  // if (_.findIndex(users, {socket: socket.id}) !== -1) {
  //   socket.emit("login_error", "You are already connected.");
  // }
  // socket.on("login", function(data) {
  //   // if this socket is already logged in,
  //   // send a failed login message
  //   if (
  //     _.findIndex(users, {
  //       socket: socket.id
  //     }) !== -1
  //   ) {
  //     socket.emit("login_error", "You are already connected.");
  //   }

  //   users.push({ id: data.id, socket: socket.id });
  //   console.log("socket with id " + socket.id + " logged in");
  // });

  // (() => {
  //   console.log("promisifying the socket's functions");
  //   socket.join = util.promisify(socket.join);
  //   socket.leave = util.promisify(socket.leave);
  // })();

  socket.on("join", async (roomName, metaData, callback) => {
    if(!roomName){
      console.log('no roomName provided!');
      socket.emit('errorMessage', 'No room provided. Are you stupid?')
      return;
    }
    if(!metaData){
      console.log('no metaData Provided!');
      socket.emit('errorMessage', 'No metadata provided. Required to join room.')
      return;
    }

    console.log(`socket ${socket.id} wants to join room ${roomName}`);
    console.log('provided ack callback:', callback);
    
    console.log('metaData: ', metaData);
    
    // prevent more than two clients in a room
    const membersBeforeJoined = await getRoomMembers(roomName);
    console.log('membersBeforeJoined: ',membersBeforeJoined);
    
    if(membersBeforeJoined.length > 0){
      if(membersBeforeJoined.length > 1){
        console.log(`socket ${socket.id} couldn't join room ${roomName} since it was full`);
        callback({error: 'Rummet verkar vara fullt 😥'});
        socket.emit('roomFull', 'Rummet verkar vara fullt 😥');
        return;
      }
      const roomHasSender = membersBeforeJoined.some((member) => member.data.sender);
      if(roomHasSender == metaData.sender){
        const type = metaData.sender?'sändare':'åskådare';
        console.log(`socket ${socket.id} couldn't join room ${roomName} since it was already a ${type} in it`);
        callback({error: `Det finns redan en ${type} i rummet 😮`,});
        socket.emit('roomFull', `Det finns redan en ${type} i rummet 😮`);
        return;
      }
    }

    // if (io.sockets.adapter.rooms[roomName] && Object.keys(io.sockets.adapter.rooms[roomName].sockets).length > 1) {
    //   console.log(`socket ${socket.id} couldn't join room ${roomName} since it was full`);
    //   socket.emit('roomFull', 'that room seems to be full');

    //   return;
    // }

    socket.join(roomName);
    // .then(async () => {
      console.log(`socket ${socket.id} is now joined to room ${roomName}`);
      console.log(`the connected socket has following rooms:`);
      console.log(socket.rooms);
      
      socket['data'] = metaData;
      
      let room = await getRoomMembers(roomName);
      
      // callback({received: 'yaaaas girl!!'});

        // if(Object.keys(socket.rooms[roomName].sockets).length > 2){
        //   socket.leave(roomName);
        //   console.log(`socket ${socket.id} couldn't join room ${roomName} since it was full`);
        //   socket.emit('error', 'that room seems to be full');

        //   return;
        // }

        // Handle RTC signaling transparently. Just pass on the message to the other clients
        socket.on("signal", data => {
          console.log("received signaling message from socket " + socket.id);
          // console.log(data);
          console.log(`propagating signaling message to room: ${roomName}`);
          socket.to(roomName).emit("signal", data);
        });

        // socket.on("sendMessage", function(message) {
        //   if (!message.peer_id) {
        //     console.log("no peer_id provided!!! Saay whaaaaaaa?!");
        //     return;
        //   }
        //   var peer_id = Number(message.peer_id);
        //   var contact = _.find(users, { id: peer_id });
        //   if (!contact) {
        //     console.log("no such peer found in the user list!");
        //     return;
        //   }
        //   console.log(
        //     "sending message of type " +
        //       message.type +
        //       " from " +
        //       message.id +
        //       " to " +
        //       message.peer_id
        //   );
        //   if (message.data) {
        //     console.log("data:" + JSON.stringify(message.data));
        //   }
        //   console.log("with socketId's: " + socket.id + ", " + contact.socket);
        //   io.to(contact.socket).emit("messageReceived", message);
        // });

        // Send acknowledge that they joined the room
        // roomMessage = {
        //   room: room,
        //   joined: true
        // };
        socket.on('getRoom', () => {
          socket.emit("room", room);
        });

        socket.on('peerObjectCreated', () => {
          console.log('received peerObjectCreated from: ' + socket.id);
          socket.to(roomName).emit("peerObjectCreated");
        })

        callback(room);
        socket.to(roomName).emit('room', room);


        // socket.emit("room", room);
      // })
      // .catch((err) => console.log(`err: ${err}`));
  }) //on join end

  socket.on("leave", async (roomName, callback) => {
    socket.leave(roomName);
    let room = await getRoomMembers(roomName);
    console.log(`left room: ${roomName}`);
    socket.removeAllListeners("signal");
    socket.removeAllListeners("getRoom");
    socket.removeAllListeners("peerObjectCreated");
    console.log('emitting room event with:', room);
    io.to(roomName).emit('room', room);

    // socket.emit('room', room);
    callback(room);
  })

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected. id: " + socket.id);
    console.log('reason: ', reason);
    for(const key of Object.keys(socket.rooms)){
      const members = getRoomMembers(key);
      io.to(key).emit('room', members);
    }
    // _.remove(users, function(user) {
    //   return user.socket == socket.id;
    // });
  });
});

http.listen(PORT, function () {
  var host = http.address().address;
  var port = http.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
  // console.log('listening on *:' + PORT);
});
