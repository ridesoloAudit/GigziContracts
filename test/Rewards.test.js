const GigBlack = artifacts.require("./GigBlack.sol");
import assertRevert from '../node_modules/openzeppelin-solidity/test/helpers/assertRevert';
import {getFeeOfAmount, amountWithoutFee, getBigNumberTokens, isValueEqualWithError, getTransferTime} from './utils.test.js' 
import { increaseTimeTo, duration } from '../node_modules/openzeppelin-solidity/test/helpers/increaseTime';
import latestTime from '../node_modules/openzeppelin-solidity/test/helpers/latestTime';
import { advanceBlock } from '../node_modules/openzeppelin-solidity/test/helpers/advanceToBlock';
import EVMRevert from '../node_modules/openzeppelin-solidity/test/helpers/EVMRevert';

const BigNumber = web3.BigNumber;


require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


/// test reward calculations
contract('Reward tests', function([CA, feeCollector, user1, user2, user3]) {

    const _decimals = 18;    
    
    const _timeAccuracyAllowed = 2; // 1 sec allowed for time difference between function calls

    const _totalSupply = getBigNumberTokens(100 * 10**6, _decimals); // 100M and 8 decimals

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    
    
    before(async function () {
        await advanceBlock();
    });

    beforeEach(async function () {
        this.gigBlack = await GigBlack.new(feeCollector);
        const txInfo = await web3.eth.getTransaction(this.gigBlack.transactionHash); 
        const blockInfo = await web3.eth.getBlock(txInfo.blockNumber)
        this.creationTime = blockInfo.timestamp;
    });

    it('should return a correct reward after creation of the contract for CA', async function () {
        const [rewardAccum, supplyTimeTotal, time] = await this.gigBlack.getAccountReward(CA);
        const timeDelta = time-this.creationTime; 
        
        rewardAccum.should.be.bignumber.equal(_totalSupply.mul(timeDelta));
        supplyTimeTotal.should.be.bignumber.equal(_totalSupply.mul(timeDelta));
    });


    describe('clean rewards accumulated', function () {
        it('should have reward after 5 seconds' , async function () {

            const waitTill = this.creationTime + duration.seconds(5);
            await increaseTimeTo(waitTill);

            let [rewardAccum, supplyTimeTotal,time] = await this.gigBlack.getAccountReward(CA);
            const timeDelta = time - this.creationTime; // seconds

            rewardAccum.eq(_totalSupply.mul(timeDelta)).should.be.true;
            supplyTimeTotal.eq(_totalSupply.mul(timeDelta)).should.be.true;            

        });
        it('should have reward after 30 days' , async function () {

            const waitTill = this.creationTime + duration.days(30);
            await increaseTimeTo(waitTill);

            let [rewardAccum, supplyTimeTotal,time] = await this.gigBlack.getAccountReward(CA);
            const timeDelta = time - this.creationTime; // seconds

            rewardAccum.should.be.bignumber.equal(_totalSupply.mul(timeDelta));
            supplyTimeTotal.should.be.bignumber.equal(_totalSupply.mul(timeDelta));       
        });

    });

    
    describe('first transfer', function () {
        it('should count the whole balance after first transfer' , async function () {
            
            // wait a day
            const waitTill = this.creationTime + duration.days(1);
            await increaseTimeTo(waitTill);

            // transfer
            const resultTransfer = await this.gigBlack.transfer(user1, 1000, { from: CA });
            const [rewardAccum, supplyTimeTotal, time] = await this.gigBlack.getAccountReward(CA);

            const transferTime = await getTransferTime(resultTransfer);
            const rewardBeforeTransfer = _totalSupply.mul(transferTime - this.creationTime);
            const rewardAfterTransfer = _totalSupply.sub(1000).mul(time - transferTime); // most likely = 0
            
            const expectedReward = rewardBeforeTransfer.add(rewardAfterTransfer); 

            rewardAccum.should.be.bignumber.equal(expectedReward);
            supplyTimeTotal.should.be.bignumber.equal(_totalSupply.mul(time - this.creationTime));     
        });

        it('should be zero reward for user just received first transfer' , async function () {
            
            // wait a day
            const waitTill = this.creationTime + duration.days(1);
            await increaseTimeTo(waitTill);

            // transfer
            const resultTransfer = await this.gigBlack.transfer(user1, 1000, { from: CA });

            const [rewardAccum, supplyTimeTotal,time] = await this.gigBlack.getAccountReward(user1);

            const transferTime          = await getTransferTime(resultTransfer);
            const rewardAfterTransfer   = amountWithoutFee(new BigNumber(1000)).mul(time - transferTime); // most likely = 0

            // expect zero reward for account who just received transfer 
            rewardAccum.should.be.bignumber.equal(rewardAfterTransfer);
            supplyTimeTotal.should.be.bignumber.equal(_totalSupply.mul(time - this.creationTime)); 
        });
        
        it('should not be zero reward for user after first transfer after some time' , async function () {
            
            // wait a day
            let waitTill = this.creationTime + duration.days(1);
            await increaseTimeTo(waitTill);

            // transfer
            const resultTransfer = await this.gigBlack.transfer(user1, 1000, { from: CA });
            const transferTime = await getTransferTime(resultTransfer);
 

            // wait an hour
            waitTill = waitTill + duration.hours(1);
            await increaseTimeTo(waitTill);

            const [rewardAccum, supplyTimeTotal, time] = await this.gigBlack.getAccountReward(user1);

            rewardAccum.should.be.bignumber.equal(amountWithoutFee(new BigNumber(1000)) * (time - transferTime));
            supplyTimeTotal.should.be.bignumber.equal(_totalSupply.mul(time - this.creationTime)); 
        });
    });


});