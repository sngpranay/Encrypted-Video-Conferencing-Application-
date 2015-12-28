  var socket = io();

  var sourcevid = document.getElementById('sourcevid');
  var remotevid = document.getElementById('remotevid');
  var localStream = null;
  var peerConn = null;
  var started = false;
  var channelReady = false;
  var mediaConstraints = {'mandatory': {
                          'OfferToReceiveAudio':true,
                          'OfferToReceiveVideo':true }};
  var isVideoMuted = false;
//-----------------------------------------------

  var btn1 = document.getElementById('button').onclick = evaluate;

  function evaluate(){


    var roomValue = document.getElementById("createRoombox").value;
    var joinValue = document.getElementById("joinRoombox").value;
    console.log(roomValue);
    console.log(joinValue);
    if(roomValue != "" && joinValue != ""){
      alert("You can only choos one !");
    }else if(roomValue == ""  && joinValue == ""){
      alert("You need to choose one !");
    }else if(joinValue == ""){
      room = roomValue;
      join = null;
      // location.href = 'http://52.33.114.191/'+room;
      }
    else if(roomValue == ""){
      join = joinValue;
      room = null;
      // location.href = 'http://52.33.114.191/'+join;
      }

    var config = {
      joinRoom: join,
      createRoom: room
    }

    socket.emit('client', config);

    socket.on('alert_created', function(alert){
      window.alert('Sorry ! You have already created a room') ;
    });

    socket.on('alert_join', function(alert){
      window.alert('Sorry ! You have already joined a room') ;
    });

    socket.on('join_fail', function(alert){
      window.alert('Sorry ! But the room you want to join doesn\'t exist') ;
    });

    socket.on('redirect_create', function(x){
      location.href = 'http://52.33.114.191/'+ x;
    });

    socket.on('redirect_join', function(y){
      location.href = 'http://52.33.114.191/'+ y;
    });
}

// socket.on('connect', onChannelOpened)
//       .on('message', onMessage);


socket.on('name', function(foo){
  console.log('client name is ' + foo) ;
});


  //>>>>>>>>>>>>>>>>>>>>>>>>>> Get User Media

  function startVideo() {
    navigator.getUserMedia({
      audio: true,
      video: true
    }, success, error);

    function success(stream) {
      localStream = stream ;
      sourcevid.src = window.URL.createObjectURL(stream);
    }

    function error(error) {
      console.log("The following error occured: " + error.name);
    }
  }
  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Stop Video

  function stopVideo() {
    if (sourcevid.src) {
      localStream.stop();
      //sourcevid.src = null;
      console.log('Video Stream Stopped');
    } else {
      sourcevid.src = "";
      localStream.stop();
    }
  }

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  //>>>>>>>>>>>>>>>>>>>>>>>>>Send Offer
function setLocalAndSendMessage(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    console.log("Sending: SDP");
    console.log(sessionDescription);
    socket.json.send(sessionDescription);
  }

  var mediaConstraints = {
    'mandatory': {
      'OfferToReceiveAudio': false,
      'OfferToReceiveVideo': true
    }
  };

  function error(error) {
    alert('Create Offer Failed - ' + error);
  }
  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function connect(){
  if (!started && localStream && channelReady) {
        createPeerConnection();
        started = true;
        pc.createOffer(setLocalAndSendMessage,error, mediaConstraints);
      } else {
        alert("Local stream not running yet - try again.");
      }
  }

  function hangUp() {
      console.log("Hang up.");
      socket.json.send({type: "bye"});
      stop();
    }

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Reply To Offer/Answer


  function onChannelOpened(evt){
    console.log('Channel opened.');
    console.log('Welcome to the chat !');
    channelReady = true;
    }

    function onMessage(evt) {
        if (evt.type === 'offer') {
          console.log("Received offer...")
          if (!started) {
            createPeerConnection();
            started = true;
          }
          console.log('Creating remote session description...' );
          pc.setRemoteDescription(new RTCSessionDescription(evt));
          console.log('Sending answer...');
          pc.createAnswer(setLocalAndSendMessage, error, mediaConstraints);

        } else if (evt.type === 'answer' && started) {
          console.log('Received answer...');
          console.log('Setting remote session description...' );
          pc.setRemoteDescription(new RTCSessionDescription(evt));

        } else if (evt.type === 'candidate' && started) {
          console.log('Received ICE candidate...');
          var candidate = new RTCIceCandidate({sdpMLineIndex:evt.sdpMLineIndex,
                                                  sdpMid:evt.sdpMid,
                                                    candidate:evt.candidate});
          console.log(candidate);
          pc.addIceCandidate(candidate);

        } else if (evt.type === 'bye' && started) {
          console.log("Received bye");
          stop();
        }
      }
  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Create Peer Connection
  function createPeerConnection() {
    console.log('Creating peer connection');
    var pc_config = {
      "iceServers": [{"url": "stun:stun.l.google.com:19302" }]
    };

    try {
     pc = new RTCPeerConnection(pc_config);
    }
    catch (e) {
     console.log("Failed to create PeerConnection, exception: " + e.message);
   }

    pc.onicecandidate = function(evt) {
      if (evt.candidate) {
           console.log('Sending ICE candidate...');
           console.log(evt.candidate);
           socket.json.send({type: "candidate",
                             sdpMLineIndex: evt.candidate.sdpMLineIndex,
                             sdpMid: evt.candidate.sdpMid,
                             candidate: evt.candidate.candidate});
         } else {
           console.log("End of candidates.");
         }
       };


    console.log('Adding local stream') ;
    pc.addStream(localStream);

    pc.onaddstream = function(evt) {
      console.log('Adding remote stream..');
      remotevid.src = window.URL.createObjectURL(evt.stream);
    };

// Add event listener from Stack Overflow
  }


  function creatOffer(){
    createPeerConnection();
    pc.createOffer(setLocalAndSendMessage,error, mediaConstraints);

  }

  function createAnswer(){
createPeerConnection();
console.log('Creating remote session description...' );
pc.setRemoteDescription(new RTCSessionDescription(evt));
console.log('Sending answer...');
pc.createAnswer(setLocalAndSendMessage, error, mediaConstraints);

  }

  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
