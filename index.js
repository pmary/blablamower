const { cpus } = require('os')
const readline = require('readline')
const fs = require('fs')
const execSync = require('child_process').execSync
const OperateMower = require('./operateMowerFork')

/**
 * The main function
 * @param {string} inputFilePath The path to an instructions file
 */
exports.main = async (inputFilePath) => {
    let outputs = []
    // Count the expected number of mowers
    let nLines = execSync(`wc -l ${inputFilePath}`).toString()
    let nMowers = Number(nLines[0]) / 2
    const lineCounter = ((i = 0) => () => ++i)();
    let lawnUpperRight // Coordinates of the upper right corner of the lawn
    let lineBuffer = []
    let lineBufferCounter = 0
    let mowerCount = 0 // Count the instantiated mowers

    // We read the instructions file line-by-line, using the `readline` native 
    // module. We supply the readline method with a stream we created first 
    // using another native module: `fs`.
    const readInterface = readline.createInterface({
        input: fs.createReadStream(inputFilePath),
        crlfDelay: Infinity,
        console: false
    })
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    readInterface.on('line', (line, lineno = lineCounter()) => {
        // Each line in input.txt will be successively available here as `line`.

        if (lineno === 1) {
            // Get the coordinates of the upper right corner of the lawn
            lawnUpperRight = line.split` `.map(x=>+x)
        } else {
            lineBufferCounter++;
            lineBuffer.push(line)
            if (lineBufferCounter === 2) {
                // Get the mower parameters
                let coordinates = lineBuffer[0].split` `.map(x=>+x).slice(0, 2)
                let orientation = lineBuffer[0].split` `.slice(-1).pop()
                let instructions = lineBuffer[1].split('')

                // Instantiate a new mower
                let mower = new OperateMower(
                    mowerCount, // id
                    coordinates[0], // x
                    coordinates[1], // y
                    orientation, // o
                    instructions,
                    lawnUpperRight[0], // maxX
                    lawnUpperRight[1], // maxY
                )
                // console.log(mower)
                mower.on('move', (coordinates) => {
                    console.log('move', coordinates)
                })
                mower.on('debug', (data) => {
                    console.log('DEBUG:', data)
                })
                mower.on('end', (data) => {
                    // Insert the mower's final position to the outputs array
                    // using it's id as position (since the ids are incrementals
                    // it allow us to store the results in the order that the 
                    // mower appeared in the input)
                    outputs.splice(data.id, 0, data.result)

                    // When we got the results from all the mowers we expected
                    // to run
                    if (outputs.length === nMowers) {
                        // Output the results
                        outputs.forEach((output) => {
                            process.stdout.write(`${output} \n`)
                        })

                        // Exit the process
                        process.exit()
                    }
                })

                mower.start()

                // Reset the line buffer and its counter
                lineBuffer = []
                lineBufferCounter = 0
                mowerCount++
            }
        }
    })
    .on('close', function() {

    })
}