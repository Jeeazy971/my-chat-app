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
