const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {};

io.on('connection', socket => {
    console.log('Connecté:', socket.id);
    players[socket.id] = { id: socket.id, x: 0, y: 1.6, z: 0 };
    socket.emit('init', players);
    socket.broadcast.emit('player-joined', players[socket.id]);

    socket.on('move', pos => {
        if (players[socket.id]) {
            players[socket.id] = { ...players[socket.id], ...pos };
            socket.broadcast.emit('player-moved', { id: socket.id, ...pos });
        }
    });

    socket.on('shoot', data => {
        socket.broadcast.emit('player-shot', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('player-left', socket.id);
    });
});

http.listen(PORT, () => console.log(`Serveur VR sur http://localhost:${PORT}`));