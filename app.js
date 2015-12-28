var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var shortid = require('shortid');

var rooms = [];
var info = {
            Room : ' ' ,
            members : []
          }
var list = [];

http.listen(3000, function() {
  console.log('Listening on port 3000');
});

app.use('/', express.static(__dirname + '/Public'));
app.use('/',express.static(__dirname + '/Public/js'));
app.use('/',express.static(__dirname + '/Public/styles'));


app.get('/', function(req, res) {
  res.sendfile('index.html');
});


io.sockets.on('connection', function(socket) {



      var id  = shortid.generate() ;
      console.log(id + ' has connected');
      socket.createdRoom = false;


  socket.on('client', function(config)

  {
      socket.name = id;
      socket.joinRoom = config.joinRoom ;
      socket.createRoom = config.createRoom;


      if(socket.createRoom == null) //Client wants to Join Room
          {
          if(socket.createdRoom == true)
          {
            io.emit('alert_join', 'alert');
          }

          else if(socket.createdRoom == false)
          {
          console.log(rooms);
          if (searchArray(socket.joinRoom, rooms) == true) // If room exists
              {
                    console.log(socket.name + ' wants to join room ' + socket.joinRoom);
                    for(var i = 0; i < list.length ; i++) //Find index of room in list array
                      {
                          if(list[i].Room == socket.joinRoom)  //  if room at index is desired room, add client as participant in said room
                            {
                              list[i].members.push(socket.name); //Add client in members array of room object
                              socket.roomEntry = list[i].members.indexOf(socket.name);
                              console.log('Rooms : ' + rooms);
                              console.log(list);
                              var y = socket.joinRoom ;
                              io.emit('redirect_join', y);
                            }
                      }
              }
          else
              {
                  console.log(rooms);
                  console.log(socket.joinRoom + ' doesn\'t exist');
                  io.emit('join_fail', 'alert');
              }
            }
          }

    else if(socket.joinRoom == null) //Create Room && havent created room before
          {

                if(socket.createdRoom == true)
                {
                  io.emit('alert_created', 'alert');
                }

                else if(socket.createdRoom == false)
              {
                console.log(socket.createRoom + ' was created by ' + socket.name);
                rooms.push(socket.createRoom);
                list.push({Room : socket.createRoom, members : [socket.name]});
                console.log('Rooms : ' + rooms);
                console.log(list);
                socket.createdRoom = true;
                socket.roomEntry = 0 ;
                var x = socket.createRoom ;
                io.emit('redirect_create', x);
              }
            }




  });

  console.log(rooms);

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });



});

function searchArray(query,array)
        {
          for(i = 0; i <= array.length ; i++)
          {
              if(array[i] == query)
                {
                  return true;
                }

          }
        }

//When a person joins, ask him wether he wants to create room
//or join room. If create room is selected then add the created room
// in the rooms array. If join room then don't give him the option
// to create room only match the desired room to join with room in array,
// now after client has entered the room, make him exchange sdp with each/
// other participant in the room. First try with two participants then try with
// multiple participants. I'm not sure but maybe after each client exchanges,
// sdp with each other then maybe the can add each others videos on their screen.
// To create a seperate peer object for each two clients use a for loop
// to loop through the the number of clients and create new peerconn object like
// createPeerConnection(i)
// {
//   pc[i]=new PeerConnection.....
//
// }

//In short create a room and try and get two people to talk by the above method and
// see if it works.
// Try runnning mymessage between pairs of client in a room
