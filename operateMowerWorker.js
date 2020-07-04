const Mower = require('./mower.js')

process.on('message', function(msg) {
    let mower = new Mower(msg.id, msg.x, msg.y, msg.o, msg.instructions, msg.maxX, msg.maxY)

    mower.on('move', function(x, y) {
        process.send({ event: 'move', data: `${x} ${y}` })
    })

    mower.on('end', function(data) {
        process.send({ event: 'end', data: data })
    })

    mower.on('debug', function(data) {
        process.send({ event: 'debug', data: data })
    })

    mower.start()
})