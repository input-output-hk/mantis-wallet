Luna Wallet MVP Configuration instructions

1. Set up your Midnight Node and Wallet Backend and get information 
   about address under which Wallet Backend is accessible to you. 

2. Create file called 'config.json5' in directory 'resources\app' (next to 
   file 'platform-config.json5')

3. Put into this file content like below:
{
    "rpcAddress": "<address of your wallet backend instance>"
}
E.g.:
{
    "rpcAddress": "http://192.168.3.123:8342"
}

4. Now you can run Luna by executing file 'luna-wallet.exe' from this directory.