const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 8080;

io.origins('*:*');

io.on('connection', (socket) => {
  console.log(socket);
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
