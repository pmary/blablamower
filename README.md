# Setup for local development
First, you need to have Docker up and runing.  

After cloning this repository on your local machine, run the following command.
The first time, it will create build the container before starting it and
logging you into as root :

```
docker-compose run blablamower /bin/bash
```

# Run the application  
Once you are logged in the container, from the /app directory, install the dependencies with:  
```
npm package install
```

Then you can execute the program using:

```
npm run start
```

# Use a different input file
Input files are stored into the `instructions` directory. Put your instruction
file here and update the `start` command from `package.json` with its name.  

# How does it work?  
This project is using Node.js.  

The `main` function from `index.js` is called with the path of an instructions
file. It will read it, line-by-line, using the `readline` native module. We 
supply the readline method with a stream we created first using another native 
module: `fs`.  
Then, for each mower (described on two lines), we pass the parameters to a Mower
class instance, runed into a child process managed by a process pool. Results 
are passed back to the master.  
A mower instance execute the instructions, one by one. Before moving forward the mower checks that the next position isn't outside of the lawn and that there is no mower already at this coordinates. If so, the mower remains in the position and this command is discarded.  
To check the position availability, I created a `DataBase` class that impersonate a databsse / distributed file system, allowing every mower to know if a position is free and to communicate there own position via dedicated methods. Under the hood, this methods write/remove files on the local filesystem, a file representing an occupied position by it's name, formed by the X and Y coordinate variables.  

I used the Node.js ability to spawn child processes to instantiate a process pool and processed multiple mowers simultaneously. The capacity of the pool is defined in `operateMowerFork.js`.

When all the mowers are done, results are printed in the the order that the mower appeared in the input.
