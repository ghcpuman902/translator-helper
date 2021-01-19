const socket = io.connect("localhost:5000");



socket.on('connect', () => {
 
});


socket.on("disconnect", (reason) => {
  switch (reason) {
    case "io server disconnect":
      console.log("The server has forcefully disconnected the socket with socket.disconnect()", "error");
      break;
    case "io client disconnect":
      console.log("The socket was manually disconnected using socket.disconnect()", "error");
      break;
    case "ping timeout":
      console.log("The server did not respond in the pingTimeout range", "error");
      break;
    case "transport close":
      console.log("The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)", "error");
      break;
    case "transport error":
      console.log("The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)", "error");
      break;
    default:
      console.log("# Server disconnected.", "error");
      break;
  }
});

