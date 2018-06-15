const GigCrowdsale = artifacts.require("./GigCrowdsale.sol");
const GigBlack = artifacts.require("./GigBlack.sol");

import { advanceBlock } from '../node_modules/openzeppelin-solidity/test/helpers/advanceToBlock';
import latestTime from '../node_modules/openzeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from '../node_modules/openzeppelin-solidity/test/helpers/increaseTime';
import ether from '../node_modules/openzeppelin-solidity/test/helpers/ether';
import EVMRevert from '../node_modules/openzeppelin-solidity/test/helpers/EVMRevert';

import {getBigNumberTokens} from './utils.test.js' 

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('GigCrowdsale tests', function([CA, feeCollector, someInvestor]) {

    // total supply 1e26
    // total mcap 100 ETH
    // 1 eth = totalSupply / totalMCAP = 1e24 token
    // 1e18 wei = 1e24 tokens
    // 1 wei = 1e6 tokens
    
    const RATE = new BigNumber(1000000); // 1e6 tokens per wei
    const CAP = ether(2); // // we sell 2% = we want to raise 2ETH
    
    const _totalSupply = getBigNumberTokens(100 * 10**6, 18); // 100M and 18 decimals = 1e26
    
    before(async function () {
        await advanceBlock();
    });
    
    beforeEach(async function () {

        this.openingTime = latestTime() + duration.weeks(1);
        this.closingTime = this.openingTime + duration.weeks(1);
        this.afterClosingTime = this.closingTime + duration.seconds(1);
        
        
        // deploy token contract
        this.gigBlack = await GigBlack.new(feeCollector);
        
        // deploy crowdsale
        this.crowdsale = await GigCrowdsale.new(
            this.openingTime, this.closingTime, RATE, CAP, CA, this.gigBlack.address
        );

        // disable fee system while crowdsale
        await this.gigBlack.setFeeEnabled(false);
        
        // transfer all tokens that should be sold during crowdsale
        await this.gigBlack.transfer(this.crowdsale.address, _totalSupply);
    });
    
    it("should create crowdsale with correct parameters", async function() {
        this.gigBlack.should.exist;
        this.crowdsale.should.exist;

        const openingTime = await this.crowdsale.openingTime();
        const closingTime = await this.crowdsale.closingTime();
        const rate = await this.crowdsale.rate(); 
        const cap = await this.crowdsale.cap();
        const walletAddress = await this.crowdsale.wallet();

        openingTime.should.be.bignumber.equal(this.openingTime);
        closingTime.should.be.bignumber.equal(this.closingTime);
        rate.should.be.bignumber.equal(RATE);
        cap.should.be.bignumber.equal(CAP);
        walletAddress.should.be.equal(CA);
        
    });

    it('should not accept payments before start', async function () {
        await this.crowdsale.send(ether(1)).should.be.rejectedWith(EVMRevert);
        await this.crowdsale.buyTokens(someInvestor, { from: someInvestor, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });
    
    
    
    it('should accept payments during the sale', async function () {
        const investmentAmount = ether(1);
        const expectedTokenAmount = RATE.mul(investmentAmount);

        await increaseTimeTo(this.openingTime);
        await this.crowdsale.buyTokens(someInvestor, { value: investmentAmount, from: someInvestor });
        (await this.gigBlack.balanceOf(someInvestor)).should.be.bignumber.equal(expectedTokenAmount);
        (await this.gigBlack.totalSupply()).should.be.bignumber.equal(_totalSupply);
       
    });

    it('should reject payments after end', async function () {
        await increaseTimeTo(this.afterClosingTime);
        await this.crowdsale.send(ether(1)).should.be.rejectedWith(EVMRevert);
        await this.crowdsale.buyTokens(someInvestor, { value: ether(1), from: someInvestor }).should.be.rejectedWith(EVMRevert);
       
    });

    it('should reject payments over cap', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.send(CAP);
        await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });
});

