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
The `main` function from `index.js` is called with the path of an instructions
file. It will read it, line-by-line, using the `readline` native module. We 
supply the readline method with a stream we created first using another native 
module: `fs`.  
Then, for each mower (described on two lines), we pass the parameters to a Mower
class instance, runed into a child process managed by a process pool. Results 
are passed back to the master. When all the mowers are done, results are printed
in the the order that the mower appeared in the input.
