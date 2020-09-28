class Room {
    constructor(id) {
        this.id = id;
        this.userCount = 0;
        this.userList = [];
        this.colors = ["#ff0000", "#00ff00", "#0000ff"];
    }

    addUser(user) {
        this.userCount++;
        this.userList.push(user);
    }

    removeUser(name) {
        this.userList = this.userList.filter((user) => user.name != name);
        this.userCount--;
    }

    getColor() {
        return this.colors[this.userCount];
    }
}

module.exports = Room;
