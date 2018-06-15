
let GigBlack        = artifacts.require("./GigBlack.sol");
let GigGold         = artifacts.require("./GigGold.sol");
let GigCrowdsale    = artifacts.require("./GigCrowdsale.sol");


const config = {
    addressTxFeeCollector: web3.eth.accounts[1],
    hardCapWei: 1000000,
};


module.exports = function(deployer) {
    deployer.deploy(GigBlack, config.addressTxFeeCollector);
    deployer.deploy(GigGold, config.addressTxFeeCollector);
    //deployer.deploy(GigCrowdsale, config.hardCapWei, {gas: 4700000});
};
