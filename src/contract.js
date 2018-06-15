import gigBlack from '../build/contracts/GigBlack.json';
import gigGold from '../build/contracts/GigGold.json';


import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract';

const Contract = {

    GigBlack: null,
    GigGold: null,
    web3RPC: null,
    provider: null,
    
    
    accounts: null,

    config: {
       txFee: 10000     // in gigs
    },

    networks: {
        development: {
            host: "testrpc",
            port: 8545,
        },
        private: {
            host: "127.0.0.1",
            port: 8545,
        }
    },
    
    network: null,
    
    
    init: function(callback)
    {
        this.network = this.networks.private;
        
        // define blockchain provider
        this.provider = new Web3.providers.HttpProvider('http://' + window.location.hostname + ":" + this.network.port);

        this.GigBlack = contract(gigBlack);
        this.GigBlack.setProvider(this.provider);

        this.GigGold = contract(gigGold);
        this.GigGold.setProvider(this.provider);

        this.web3RPC = new Web3(this.provider);

        // init fee collector address
        this.GigBlack.deployed().then((instance) => {
            instance.getTxFeeCollector.call().then((address)=>{

                if (!address || parseInt(address, 16) === 0) {
                    console.log("Collector address is not set. Configuring...");

                    this.web3RPC.eth.getAccounts( (err, accs) => {
                        if (err) {
                            alert("There was an error fetching your accounts.");
                            return;
                        }

                        if (accs.length < 2) {
                            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                            return;
                        }

                        instance.setTxFeeCollector(accs[1], {from: accs[0] }).then((result)=>{
                        }).catch(function (e) {
                            console.log("E",e);
                        });

                    });
                }
            });
        });

        this.web3RPC.eth.getAccounts( (err, accs) => {
            this.accounts = accs;
        });
    },

    getProvider: function(){
        return this.provider;        
    },
    
    getOwner()
    {
        return this.accounts[0];       
    },
    
    toGig: function(value)
    {
        return (value * (10 ** 8));
    },

    fromGig: function(value)
    {
        return (value / (10 ** 8));
    },

    parseReward: function (reward, total)
    {
        let result = 0;
        if (total) {
            result = reward * 100 / total;
            const maxDigits = 6 ;
            result = Math.round(result*Math.pow(10,maxDigits))/Math.pow(10,maxDigits);
        }
        return result;
    }
    
};


export default Contract;
