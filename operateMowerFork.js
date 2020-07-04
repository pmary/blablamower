const EventEmitter = require('events')
const ProcessPool = require('./processPool.js')

// Initialize a ProcessPool object using operateMowerFork.js file as target, 
// which represents ou child worker. We also set 2 as the maximum capacity of 
// the pool
let workers = new ProcessPool(__dirname + '/operateMowerWorker.js', 2)

/**
 * OperateMowerFork is a wrapper for ProcessPool. It's role is to communicate
 * with the worker and expose the results it produces.
 * Start a process with child_process.fork() gives us a message-based 
 * communication channel
 * 
 * @param {*} mower 
 * @param {*} set 
 */
module.exports = class OperateMowerFork extends EventEmitter {
    constructor(id, x, y, o, instructions, maxX, maxY) {
        super()
        this.id = id
        this.x = x
        this.y = y
        this.o = o
        this.instructions = instructions
        this.maxX = maxX
        this.maxY = maxY
    }

    /**
     * The start method trigger the execution of the algorithm, which run on a 
     * separate process at this time
     */
    start = () => {
        // Try to acquire the new child process from the pool
        workers.acquire(function(worker) {
            // When it happens, immediatly use the worker handle to send the child
            // process a message with the input of the job to run.
            // The send() API is provided automatically by Node.js to all processes 
            // that start with child_process.fork()
            worker.send({
                id: this.id,
                x: this.x, 
                y: this.y, 
                o: this.o, 
                instructions: this.instructions,
                maxX: this.maxX,
                maxY: this.maxY,
            })

            // Listener
            let onMessage = function(msg) {
                // We first check whether we received an `end` event, which means
                // that the OperateMowerFork task has finished, in which case we
                // remove the onMessage listener and release the worker, putting it
                // back to the pool
                if (msg.event === 'end') {
                    worker.removeListener('message', onMessage)
                    workers.release(worker)
                }

                // The worker produces messages in the format (event, data)
                // allowing us to seamlessly re-emit any event produced by the child
                // process
                this.emit(msg.event, msg.data)
            }.bind(this)
    
            // Start listening for any message returned from the worker process, 
            // using the on() method to attach a new listener (provided by all 
            // processes that start with child_process.fork())
            worker.on('message', onMessage)
        }.bind(this))
    }

}