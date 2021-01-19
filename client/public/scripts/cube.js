const { RTCPeerConnection, RTCSessionDescription } = window;

let isAlreadyCalling = false;
let getCalled = false;
const peerConnection = new RTCPeerConnection();

const socket = io.connect("localhost:5000");
socket.on('connect', () => {
    console.log(`index.js: socket connected with ID: "${socket.id}".`);
});

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

let paintCanvas = () => {
  var now = new Date();
  var hour = now.getHours()<10?"0"+now.getHours():now.getHours();
  var minute = now.getMinutes()<10?"0"+now.getMinutes():now.getMinutes();
  var second = now.getSeconds()<10?"0"+now.getSeconds():now.getSeconds();
  var mil = now.getMilliseconds();
  mil = "000000000" + mil;
  mil = mil.substr(mil.length-3);
  
  if(ctx){
    ctx.fillStyle = '#ffdd00';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'pink';
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 1080);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(1920, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
  
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(0, 0);
    ctx.lineTo(1920, 1080);
    ctx.lineTo(1920, 0);
    ctx.lineTo(0, 1080);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.font = "200px Helvetica";
    ctx.fillText(hour+":"+minute+":"+second+":"+mil, 400, 1080/2);
  }

  requestAnimationFrame(paintCanvas);
}
requestAnimationFrame(paintCanvas);

navigator.mediaDevices.getUserMedia({ audio: true,  video: { width: 1920, height: 1080 } })
.then(function(stream) {


  
  var stream = canvas.captureStream(25);
  localVideo = document.getElementById("local-video");
  if (localVideo) {
    localVideo.srcObject = stream;
    localVideo.setAttribute("playsinline", true);
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  }
})
.catch(function(err) {
    console.warn(err.message);
});


// peerConnection.getStats(null).then(stats => {
// // this shoud be run from within a setTimeinterval, however because it takes too long to run,
// // it interferce with the ontrack, causing no remote stream to be displayed on the screen.≈
//   var statsOutput = "";

//   stats.forEach(report => {
//     if (report.kind === "video") {
//     //if (report.type === "inbound-rtp" && report.kind === "video") {
//       Object.keys(report).forEach(statName => {
//         statsOutput += `<strong>${statName}:</strong> ${report[statName]}<br>\n`;
//       });
//     }
//   });

//   document.querySelector(".stats-box").innerHTML = statsOutput;
// });


function createUserItemContainer(socketId, isItThisSocket) {
    const userContainerDiv = document.createElement("div");
    
    const usernameP = document.createElement("p");    
    
    if(isItThisSocket){
        userContainerDiv.setAttribute("class", "this-user");
        userContainerDiv.setAttribute("id", socketId);
        
        usernameP.setAttribute("class", "username");
        usernameP.innerHTML = `Socket.io ID: ${socketId} (This one)`;
        
        userContainerDiv.appendChild(usernameP);
    }else{

        userContainerDiv.setAttribute("class", "active-user");
        userContainerDiv.setAttribute("id", socketId);

        usernameP.setAttribute("class", "username");
        usernameP.innerHTML = `Socket.io ID: ${socketId}`;
        
        userContainerDiv.appendChild(usernameP);

        userContainerDiv.addEventListener("click", () => {
          // unselectUsersFromList();
          userContainerDiv.setAttribute("class", "active-user active-user--selected");
          const talkingWithInfo = document.getElementById("talking-with-info");
          talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
          callUser(socketId);
        }); 
    }
    return userContainerDiv;
}

function updateUserList(socketIds, thisSocketId) {
    const activeUserContainer = document.getElementById("active-user-container");
    
    socketIds.forEach(socketId => {
      const alreadyExistingUser = document.getElementById(socketId);
      if (!alreadyExistingUser) {
          const userContainerEl = createUserItemContainer(socketId, socketId == thisSocketId);
          activeUserContainer.appendChild(userContainerEl);
      }
    });
}


socket.on("update-user-list", ({ users }) => {
    let thisSocketId = socket.id;
    updateUserList(users, thisSocketId);
});

socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);
    
    if (elToRemove) {
      elToRemove.remove();
    }
});



async function callUser(socketId) {
  console.log("Calling "+socketId);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
  console.log(`index.js: Tring to call "${socketId}" with the offer:
################################################
${offer.sdp}
################################################
  `);
  socket.emit("call-user", {
    offer,
    to: socketId
  });
}


peerConnection.ontrack = async function({ streams: [stream] }) {
  const remoteVideo = document.getElementById("remote-video");

  console.log(`index.js: peerConnection.ontrack triggere with renmote stream:`);
  console.log(stream);
  if (remoteVideo) {
    remoteVideo.srcObject = stream;
    remoteVideo.setAttribute("playsinline", true);
    console.log(`index.js: attached stream to #remote-video`);
  }
};

socket.on("call-made", async data => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    console.log(`index.js: Call received from "${data.socket}" with the offer:
################################################
${data.offer.sdp}
################################################
    `);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    socket.emit("make-answer", {
      answer,
      to: data.socket
    });
    console.log(`index.js: Answer made to "${data.socket}":
################################################
${answer.sdp}
################################################
    `);
});

socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
    console.log(`index.js: Answer received from "${data.socket}" with the answer:
################################################
${data.answer.sdp}
################################################
    `);
    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }

});








