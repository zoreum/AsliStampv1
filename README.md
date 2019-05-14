# AsliStamp V.0.1 
# V.0.1 is POC code running with Truffle and Ganache with local RPC
# To configure local rpc edi the truffle-config.js and give host & port where Ganache is running

# Step 1: To compile and migrate the Smart Contracts follow below commands
> cd contracts
> truffle compile
> truffle migrate

# Step 2: To generate the react client and to call the Smart Contracts from UI run below commands
> cd client
> npm run build
> npm run start
