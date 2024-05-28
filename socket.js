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
