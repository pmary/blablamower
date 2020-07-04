const { fork } = require('child_process')

/**
 * The ProcessPool class allow to create a pool of running processes
 * Starting a new process is expensive and requires time, so keeping them constantly running and ready to handle 
 * requests allow us to save time and CPU
 */
module.exports = class ProcessPool {
    constructor(file, poolMax) {
        this.file = file
        this.poolMax = poolMax
        this.pool = [] // The set of running process ready to be used
        this.active = [] // The list of process currently being used
        this.waiting = [] // The queue of callbacks for all the requests that could 
            // not be fulfilled immediately because of the lack of an available process
    }

    /**
     * Method responsible for returning a process ready to be used
     */
    acquire = (callback) => {
        let worker

        // If we have a process in pool ready to be used, move it to the active list
        // and then return it by invoking callback (in a deferred fashion)
        if (this.pool.length > 0) {
            worker = this.pool.pop()
            this.active.push(worker)
            return callback.bind(null, worker)
        }

        // If there is no available process in the pool and we already have reached 
        // the maximum number of running process, we have to wait for one to be
        // available by queuing the current callback in the waiting list
        if (this.active.length >= this.poolMax) {
            return this.waiting.push(callback)
        }

        // If we haven't yet reached the max number of running processes, we create
        // a new one using child_process.fork(), add it to the active list, and then
        // return it to the caller using the callback
        worker = fork(this.file)
        this.active.push(worker)
        process.nextTick(callback.bind(null, worker))
    }

    /**
     * Put a process back in the pool
     * @todo
     * To reduce long-term memory usage and make the process pool more robust
     * - Terminate idle processes to free memory after a certain time of inactivity
     * - Add a mechanism to kill non-responsive processes, or restart thos that have crashed
     */
    release = (worker) => {
        // If there is a request in the waiting list, we reassing the worker being
        // released by passing it to the callback at the head of the waiting queue
        if (this.waiting.length > 0) {
            let waitingCallback = this.waiting.shift()
            waitingCallback(null, worker)
        }

        // Otherwise, we remove the worker from the active list and put it back to 
        // into the pool
        this.active = this.active.filter((w) => {
            return worker !== w
        })

        this.pool.push(worker)
    }
}