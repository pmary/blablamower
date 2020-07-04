const EventEmitter = require('events')
const Database = require('./database.js')

const dbClient = new Database();

/**
 * The Mower Class
 * @param {integer} id The unique id of the mower
 * @param {integer} x Array containing two integer representing the
 *  position of the mower in a cartesian plane (X,Y)
 * @param {integer} y
 * @param {string} o The direction in wich the mower is facing
 * @param {string} instructions Mower movement commands
 * @param {string} maxX X part of the coordinates of the upper right corner of the lawn
 * @param {string} maxY Y part of the coordinates of the upper right corner of the lawn
 */
module.exports = class Mower extends EventEmitter {
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
     * Turn the mower 90° left or right without moving the mower
     * @param {string} direction L or R for left or right
     */
    rotate = (direction) => {
        switch (this.o) {
            case 'N':
                if (direction === 'L') {
                    this.o = 'W'
                } else if (direction === 'R') {
                    this.o = 'E'
                }
                break
            case 'E':
                if (direction === 'L') {
                    this.o = 'N'
                } else if (direction === 'R') {
                    this.o = 'S'
                }
                break
            case 'W':
                if (direction === 'L') {
                    this.o = 'S'
                } else if (direction === 'R') {
                    this.o = 'N'
                }
              break
            case 'S':
                if (direction === 'L') {
                    this.o = 'E'
                } else if (direction === 'R') {
                    this.o = 'W'
                }
            break
        }
    }

    /**
     * Move forward one space in the direction the mower is currently facing 
     * without changing its orientation
     */
    moveForward = () => {
        let nextX = this.x
        let nextY = this.y
        switch (this.o) {
            case 'N':
                nextY = this.y + 1
                break
            case 'E':
                nextX = this.x + 1
                break
            case 'W':
                nextX = this.x - 1
                break
            case 'S':
                nextY = this.y - 1
            break
        }

        // Check if the new coordinates are valid (not outside of the lawn and
        // not occupied by another mower)
        let isPosFree = dbClient.checkPosAvailability(nextX, nextY)
        if (
            nextX >= 0 && nextX <= this.maxX &&
            nextY >= 0 && nextY <= this.maxY &&
            isPosFree
        ) {
            // Free the last position
            dbClient.freePosition(this.x, this.y)

            this.x = nextX
            this.y = nextY

            // Set the new position
            dbClient.setOccupiedPosition(this.x, this.y)
        }

        // console.log('Curr: ', this.x, this.y, this.o)
    }

    start = () => {
        // this.emit('debug', this.maxX, this.maxY)
        // console.log(`Mower ${this.id} start at`, this.x, this.y, this.o)

        // Set the initial position of the mower as occupied
        dbClient.setOccupiedPosition(this.x, this.y)

        // Read the instructions one by one
        this.instructions.forEach(instruction => {
            if (instruction === 'F') {
                this.moveForward()
            } else if (instruction === 'R' || instruction === 'L') {
                this.rotate(instruction)
            }
        })

        // At the end of the operations, free the last position of the mower
        dbClient.freePosition(this.x, this.y)
        this.emit('end', {id: this.id, result: `${this.x} ${this.y} ${this.o}` })
    }
}