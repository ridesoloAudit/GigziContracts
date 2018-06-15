const GigBlack = artifacts.require("./GigBlack.sol");
import assertRevert from '../node_modules/openzeppelin-solidity/test/helpers/assertRevert';
 

const BigNumber = web3.BigNumber;


require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('Feeable tests', function([CA, feeCollector,user]) {
    
    
    beforeEach(async function () {
        this.gigBlack = await GigBlack.new(feeCollector);
    });

    describe('FC', function () {
        it('should have zero balance initially', async function () {

            const balance = await this.gigBlack.balanceOf(feeCollector);

            balance.should.be.bignumber.equal(0);
        });
    });

    describe('transfer', function () {
        it('should change balance of FC', async function () {
            await this.gigBlack.transfer(user, 1000, { from: CA });
            const balance = await this.gigBlack.balanceOf(feeCollector);
            
            balance.should.be.bignumber.equal(2);
        });

        it('should accumulate fee  for many transfers', async function () {
            await this.gigBlack.transfer(user, 1000, { from: CA });

            await this.gigBlack.transfer(user, 10000, { from: CA });
            const balance = await this.gigBlack.balanceOf(feeCollector);

            balance.should.be.bignumber.equal(22);
        });

        it('should have a correct balance for user', async function () {
            await this.gigBlack.transfer(user, 1000, { from: CA });
            const balance = await this.gigBlack.balanceOf(user);
            
            balance.should.be.bignumber.equal(998);
        });
    });

    describe('transfer too small value', function () {
        it('should revert tx if fee is zero', async function () {
            await assertRevert(this.gigBlack.transfer(user, 499, { from: CA }));
        });
        it('should pass if fee is at least 1 token', async function () {
            await this.gigBlack.transfer(user, 500, { from: CA });
            const balance = await this.gigBlack.balanceOf(feeCollector);
            balance.should.be.bignumber.equal(1);
       });

    });
});