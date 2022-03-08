class SocketEngine {
    constructor(io) {
        this.sConnection = io;
        this.init();
    }

    async init() {
        //start listen
        var io = this.sConnection
        this.sConnection.on('connection', function (socket) {
            
            console.log(socket)
            socket.on('textAlert', async (text) => {

                socket.emit("getText", "Hello Message!");
            })
        });
    }
}

module.exports = SocketEngine;