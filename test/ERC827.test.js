const GigBlack = artifacts.require("./GigBlack.sol");
import assertRevert from '../node_modules/openzeppelin-solidity/test/helpers/assertRevert';
import EVMRevert from '../node_modules/openzeppelin-solidity/test/helpers/EVMRevert';
var Message = artifacts.require('MessageHelper');


const BigNumber = web3.BigNumber;


require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('ERC827 tests', function(accounts) {

    beforeEach(async function () {
        this.token = await GigBlack.new(accounts[1]);
    });

    it('should allow payment through transfer', async function () {
          const message = await Message.new();
  
          const extraData = message.contract.buyMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
  
          const transaction = await this.token.transferAndCall(
            message.contract.address, 100, extraData, { from: accounts[0], value: 1000 }
          );
  
          assert.equal(2, transaction.receipt.logs.length);
  
  
          new BigNumber(100).should.be.bignumber.equal(
            await this.token.balanceOf(message.contract.address)
          );
          new BigNumber(1000).should.be.bignumber.equal(
            await web3.eth.getBalance(message.contract.address)
          );
    });

    it(
      'should allow payment through approve'
      , async function () {
        const message = await Message.new();

        const extraData = message.contract.buyMessage.getData(
          web3.toHex(123456), 666, 'Transfer Done'
        );

        const transaction = await this.token.approveAndCall(
          message.contract.address, 100, extraData, { from: accounts[0], value: 1000 }
        );

        assert.equal(2, transaction.receipt.logs.length);

        new BigNumber(100).should.be.bignumber.equal(
          await this.token.allowance(accounts[0], message.contract.address)
        );
        new BigNumber(1000).should.be.bignumber.equal(
          await web3.eth.getBalance(message.contract.address)
        );
      });

      it(
        'should allow payment through increaseApproval'
        , async function () {
          const message = await Message.new();
  
          const extraData = message.contract.buyMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
  
          await this.token.approve(message.contract.address, 10);
          new BigNumber(10).should.be.bignumber.equal(
            await this.token.allowance(accounts[0], message.contract.address)
          );
  
          const transaction = await this.token.increaseApprovalAndCall(
            message.contract.address, 50, extraData, { from: accounts[0], value: 1000 }
          );
  
          assert.equal(2, transaction.receipt.logs.length);
  
          new BigNumber(60).should.be.bignumber.equal(
            await this.token.allowance(accounts[0], message.contract.address)
          );
          new BigNumber(1000).should.be.bignumber.equal(
            await web3.eth.getBalance(message.contract.address)
          );
        });      

        it(
          'should allow payment through decreaseApproval'
          , async function () {
            const message = await Message.new();
    
            await this.token.approve(message.contract.address, 100);
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], message.contract.address)
            );
    
            const extraData = message.contract.buyMessage.getData(
              web3.toHex(123456), 666, 'Transfer Done'
            );
    
            const transaction = await this.token.decreaseApprovalAndCall(
              message.contract.address, 60, extraData, { from: accounts[0], value: 1000 }
            );
    
            assert.equal(2, transaction.receipt.logs.length);
    
            new BigNumber(40).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], message.contract.address)
            );
            new BigNumber(1000).should.be.bignumber.equal(
              await web3.eth.getBalance(message.contract.address)
            );
          });
    
        it(
          'should allow payment through transferFrom'
          , async function () {
            const message = await Message.new();
    
            const extraData = message.contract.buyMessage.getData(
              web3.toHex(123456), 666, 'Transfer Done'
            );
    
            await this.token.approve(accounts[1], 100, { from: accounts[0] });
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], accounts[1])
            );
    
            const transaction = await this.token.transferFromAndCall(
              accounts[0], message.contract.address, 100, extraData, { from: accounts[1], value: 1000 }
            );
    
            assert.equal(2, transaction.receipt.logs.length);
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.balanceOf(message.contract.address)
            );
            new BigNumber(1000).should.be.bignumber.equal(
              await web3.eth.getBalance(message.contract.address)
            );
          });
    
        it('should revert funds of failure inside approve (with data)', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.showMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
    
          await this.token.approveAndCall(
            message.contract.address, 10, extraData, { from: accounts[0], value: 1000 }
          ).should.be.rejectedWith(EVMRevert);
    
          // approval should not have gone through so allowance is still 0
          new BigNumber(0).should.be.bignumber
            .equal(await this.token.allowance(accounts[1], message.contract.address));
          new BigNumber(0).should.be.bignumber
            .equal(await web3.eth.getBalance(message.contract.address));
        });
        
        it('should revert funds of failure inside transfer (with data)', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.showMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
    
          await this.token.transferAndCall(
            message.contract.address, 10, extraData, { from: accounts[0], value: 1000 }
          ).should.be.rejectedWith(EVMRevert);
    
          // transfer should not have gone through, so balance is still 0
          new BigNumber(0).should.be.bignumber
            .equal(await this.token.balanceOf(message.contract.address));
          new BigNumber(0).should.be.bignumber
            .equal(await web3.eth.getBalance(message.contract.address));
        });
    
        it('should revert funds of failure inside transferFrom (with data)', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.showMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
    
          await this.token.approve(accounts[1], 10, { from: accounts[2] });
    
          await this.token.transferFromAndCall(
            accounts[2], message.contract.address, 10, extraData, { from: accounts[2], value: 1000 }
          ).should.be.rejectedWith(EVMRevert);
    
          // transferFrom should have failed so balance is still 0 but allowance is 10
          new BigNumber(10).should.be.bignumber
            .equal(await this.token.allowance(accounts[2], accounts[1]));
          new BigNumber(0).should.be.bignumber
            .equal(await this.token.balanceOf(message.contract.address));
          new BigNumber(0).should.be.bignumber
            .equal(await web3.eth.getBalance(message.contract.address));
        });
    
        it(
          'should return correct balances after transfer (with data) and show the event on receiver contract'
          , async function () {
            const message = await Message.new();
    
            const extraData = message.contract.showMessage.getData(
              web3.toHex(123456), 666, 'Transfer Done'
            );
    
            const transaction = await this.token.transferAndCall(message.contract.address, 100, extraData);
    
            assert.equal(2, transaction.receipt.logs.length);
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.balanceOf(message.contract.address)
            );
          });
    
        it(
          'should return correct allowance after approve (with data) and show the event on receiver contract'
          , async function () {
            const message = await Message.new();
    
            const extraData = message.contract.showMessage.getData(
              web3.toHex(123456), 666, 'Transfer Done'
            );
    
            const transaction = await this.token.approveAndCall(message.contract.address, 100, extraData);
    
            assert.equal(2, transaction.receipt.logs.length);
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], message.contract.address)
            );
          });
    
        it(
          'should return correct allowance after increaseApproval (with data) and show the event on receiver contract'
          , async function () {
            const message = await Message.new();
    
            const extraData = message.contract.showMessage.getData(
              web3.toHex(123456), 666, 'Transfer Done'
            );
    
            await this.token.approve(message.contract.address, 10);
            new BigNumber(10).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], message.contract.address)
            );
    
            const transaction = await this.token.increaseApprovalAndCall(message.contract.address, 50, extraData);
    
            assert.equal(2, transaction.receipt.logs.length);
    
            new BigNumber(60).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], message.contract.address)
            );
          });
    
        it(
          'should return correct allowance after decreaseApproval (with data) and show the event on receiver contract'
          , async function () {
            const message = await Message.new();
    
            await this.token.approve(message.contract.address, 100);
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], message.contract.address)
            );
    
            const extraData = message.contract.showMessage.getData(
              web3.toHex(123456), 666, 'Transfer Done'
            );
    
            const transaction = await this.token.decreaseApprovalAndCall(message.contract.address, 60, extraData);
    
            assert.equal(2, transaction.receipt.logs.length);
    
            new BigNumber(40).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], message.contract.address)
            );
          });
    
        it(
          'should return correct balances after transferFrom (with data) and show the event on receiver contract'
          , async function () {
            const message = await Message.new();
    
            const extraData = message.contract.showMessage.getData(
              web3.toHex(123456), 666, 'Transfer Done'
            );
    
            await this.token.approve(accounts[1], 100, { from: accounts[0] });
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.allowance(accounts[0], accounts[1])
            );
    
            const transaction = await this.token.transferFromAndCall(accounts[0], message.contract.address, 100, extraData, {
              from: accounts[1],
            });
    
            assert.equal(2, transaction.receipt.logs.length);
    
            new BigNumber(100).should.be.bignumber.equal(
              await this.token.balanceOf(message.contract.address)
            );
          });
    
        it('should fail inside approve (with data)', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.fail.getData();
    
          await this.token.approveAndCall(message.contract.address, 10, extraData)
            .should.be.rejectedWith(EVMRevert);
    
          // approval should not have gone through so allowance is still 0
          new BigNumber(0).should.be.bignumber
            .equal(await this.token.allowance(accounts[1], message.contract.address));
        });
    
        it('should fail inside transfer (with data)', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.fail.getData();
    
          await this.token.transferAndCall(message.contract.address, 10, extraData)
            .should.be.rejectedWith(EVMRevert);
    
          // transfer should not have gone through, so balance is still 0
          new BigNumber(0).should.be.bignumber
            .equal(await this.token.balanceOf(message.contract.address));
        });
    
        it('should fail inside transferFrom (with data)', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.fail.getData();
    
          await this.token.approve(accounts[1], 10, { from: accounts[2] });
          await this.token.transferFromAndCall(accounts[2], message.contract.address, 10, extraData, { from: accounts[1] })
            .should.be.rejectedWith(EVMRevert);
    
          // transferFrom should have failed so balance is still 0 but allowance is 10
          new BigNumber(10).should.be.bignumber
            .equal(await this.token.allowance(accounts[2], accounts[1]));
          new BigNumber(0).should.be.bignumber
            .equal(await this.token.balanceOf(message.contract.address));
        });
    
        it('should fail approve (with data) when using this.token contract address as receiver', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.showMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
    
          await this.token.approveAndCall(this.token.contract.address, 100, extraData, { from: accounts[0] })
            .should.be.rejectedWith(EVMRevert);
        });
    
        it('should fail transfer (with data) when using this.token contract address as receiver', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.showMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
    
          await this.token.transferAndCall(this.token.contract.address, 100, extraData)
            .should.be.rejectedWith(EVMRevert);
        });
    
        it('should fail transferFrom (with data) when using this.token contract address as receiver', async function () {
          const message = await Message.new();
    
          const extraData = message.contract.showMessage.getData(
            web3.toHex(123456), 666, 'Transfer Done'
          );
    
          await this.token.approve(accounts[1], 1, { from: accounts[0] });
    
          await this.token.transferFromAndCall(accounts[0], this.token.contract.address, 1, extraData, { from: accounts[1] })
            .should.be.rejectedWith(EVMRevert);
        });        


});
