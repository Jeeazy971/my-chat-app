# Mon application de chat

Une application de chat en temps réel utilisant Node.js, Express et Socket.IO.

## Démarrage

### Prérequis

- Node.js installé sur votre machine.

### Installation

1. Clonez le dépôt :
   ```sh
   git clone https://github.com/Jeeazy971/my-chat-app.git
   ```

## Explication Détaillée de Chaque Fichier

### `index.js`

Ce fichier est le fichier principal du serveur qui configure le serveur Express et Socket.IO pour la communication en temps réel.

- Importe les modules nécessaires : Express, HTTP et Socket.IO.
- Importe les fonctions de gestion des utilisateurs depuis `user.js`.
- Configure le serveur Express pour servir des fichiers statiques depuis le répertoire `public`.
- Gère les connexions Socket.IO :
  - Lorsqu'un utilisateur se connecte, enregistre la connexion et gère les événements pour rejoindre le chat, se déconnecter, envoyer des messages et envoyer des images.
  - Événement `join` : Ajoute l'utilisateur à la liste des utilisateurs connectés et met à jour la liste des utilisateurs pour tous les clients.
  - Événement `disconnect` : Supprime l'utilisateur de la liste et met à jour la liste des utilisateurs.
  - Événement `chat message` : Diffuse le message de chat à tous les clients.
  - Événement `image message` : Diffuse l'image à tous les clients.

```javascript
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
```

### `user.js`

Ce fichier contient des fonctions pour gérer la liste des utilisateurs connectés.

- `addUser(id, username)` : Ajoute un utilisateur à l'objet users.
- `removeUser(id)` : Supprime un utilisateur de l'objet users.
- `getUser(id)` : Récupère un utilisateur par son ID de socket.
- `getUsers()` : Retourne un tableau de tous les utilisateurs connectés.

```javascript
const users = {};

function addUser(id, username) {
    users[id] = username;
}

function removeUser(id) {
    delete users[id];
}

function getUser(id) {
    return users[id];
}

function getUsers() {
    return Object.values(users);
}

export { addUser, removeUser, getUser, getUsers };
```

### `public/js/socket.js`

Ce fichier contient le JavaScript côté client pour gérer les interactions avec le serveur via Socket.IO.

- Gère la soumission du formulaire pour envoyer des messages.
- Gère le changement d'entrée du fichier pour envoyer des images.
- Écoute les événements `chat message` et `image message` pour afficher les messages et les images.
- Écoute les événements `user list` pour mettre à jour la liste des utilisateurs connectés.

```javascript
document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();

    const form = document.querySelector('form');
    const input = document.querySelector('#txtMessage');
    const imageInput = document.querySelector('#txtImage');
    const messages = document.querySelector('#msg_container');
    const userList = document.querySelector('#connected_users');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
            socket.emit('chat message', { text: input.value });
            input.value = '';
        }
    });

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            socket.emit('image message', { img: reader.result });
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    socket.on('chat message', (msg) => {
        const item = document.createElement('div');
        item.className = 'message';
        item.innerHTML = `<p>${msg.user}: ${msg.text}</p>`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('image message', (msg) => {
        const item = document.createElement('div');
        item.className = 'message';
        item.innerHTML = `<p>${msg.user}</p><img src="${msg.img}" alt="Image">`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('user list', (users) => {
        userList.innerHTML = '';
        users.forEach((user) => {
            const item = document.createElement('div');
            item.className = 'user-item';
            item.textContent = user;
            userList.appendChild(item);
        });
    });

    // Obtenir le nom d'utilisateur à partir de l'URL et rejoindre le chat
    const username = new URLSearchParams(window.location.search).get('username');
    if (username) {
        socket.emit('join', username);
    }
});
