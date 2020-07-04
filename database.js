const fs = require('fs');
const occupiedPositions = './database/positions'

/**
 * Has the role of a database
 */
module.exports = class DataBase {
    setOccupiedPosition = (x, y) => {
        fs.writeFileSync(`${occupiedPositions}/${x} ${y}`)
    }

    checkPosAvailability = (x, y) => {
        return !fs.existsSync(`${occupiedPositions}/${x} ${y}`)
    }

    freePosition = (x, y) => {
        fs.unlinkSync(`${occupiedPositions}/${x} ${y}`)
    }
}
