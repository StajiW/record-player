const io = require('socket.io')(process.env.SOCKET_PORT, {
    cors: {
        origin: '*'
    }
})

export default io