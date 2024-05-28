import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let users = {};

io.on('connection', (socket) => {
    console.log("Un utilisateur s'est connecté");

    socket.on('join', (username) => {
        users[socket.id] = username;
        io.emit('user list', Object.values(users));
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user list', Object.values(users));
        console.log('Utilisateur déconnecté');
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', { user: users[socket.id], text: msg.text });
    });

    socket.on('image message', (msg) => {
        io.emit('image message', { user: users[socket.id], img: msg.img });
    });
});

server.listen(3000, () => {
    console.log('Ecoute sur le port: 3000');
});
