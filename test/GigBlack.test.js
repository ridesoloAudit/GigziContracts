const GigBlack = artifacts.require("./GigBlack.sol");
import assertRevert from '../node_modules/openzeppelin-solidity/test/helpers/assertRevert';
import {amountWithoutFee, getBigNumberTokens} from './utils.test.js' 

const BigNumber = web3.BigNumber;


require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();



/// TODO tests
/// test Fee limit and divider  
/// test feeEnable
/// 
contract('GigBlack tests', function([CA, feeCollector, someInvestor, recipient, recipient2]) {

    const _name = 'GigziBlack';
    const _symbol = 'GZB';
    const _decimals = 18;    
    
    const _totalSupply = getBigNumberTokens(100 * 10**6, _decimals); // 100M and 8 decimals

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    
    
    beforeEach(async function () {
        this.gigBlack = await GigBlack.new(feeCollector);
    });


    it('has a name', async function () {
        const name = await this.gigBlack.name();
        name.should.be.equal(_name);
    });

    it('has a symbol', async function () {
        const symbol = await this.gigBlack.symbol();
        symbol.should.be.equal(_symbol);
    });

    it('has an amount of decimals', async function () {
        const decimals = await this.gigBlack.decimals();
        decimals.should.be.bignumber.equal(_decimals);
    });

    describe('total supply', function () {
        it('returns the total amount of tokens', async function () {
            const totalSupply = await this.gigBlack.totalSupply();

            totalSupply.should.be.bignumber.equal(_totalSupply)
        });
    });

    describe('balanceOf', function () {
        describe('when the requested account has no tokens', function () {
            it('returns zero', async function () {
                const balance = await this.gigBlack.balanceOf(someInvestor);

                balance.should.be.bignumber.equal(0);
            });
        });

        describe('when the requested account has some tokens', function () {
            it('returns the total amount of tokens', async function () {
                const balance = await this.gigBlack.balanceOf(CA);
                balance.should.be.bignumber.equal(_totalSupply);
            });
        });
    });

    /*****************************************************************************
     * Test transfer
     *****************************************************************************/

    describe('transfer', function () {
        describe('when the recipient is not the zero address', function () {
            const to = recipient;

            describe('when the sender does not have enough balance', function () {
                const amount = 100;
                
                it('reverts', async function () {
                    await this.gigBlack.transfer(someInvestor, amount, { from: CA });
                    await assertRevert(this.gigBlack.transfer(to, amount+1, { from: someInvestor }));
                });
            });

            describe('when the sender has enough balance', function () {
                const amount = _totalSupply;
                
                // receive amount minus fee
                const receiveAmount = amountWithoutFee(amount);

                it('transfers the requested amount', async function () {
                    await this.gigBlack.transfer(to, amount, { from: CA });

                    const senderBalance = await this.gigBlack.balanceOf(CA);
                    assert.equal(senderBalance, 0);
                    
                    const recipientBalance = await this.gigBlack.balanceOf(to);
                    recipientBalance.should.be.bignumber.equal(receiveAmount);
                });

                it('emits a transfer event', async function () {
                    const { logs } = await this.gigBlack.transfer(to, amount, { from: CA });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Transfer');
                    assert.equal(logs[0].args.from, CA);
                    assert.equal(logs[0].args.to, to);
                    logs[0].args.value.should.be.bignumber.equal(amount);
                });
            });
        });

        describe('when the recipient is the zero address', function () {
            const to = ZERO_ADDRESS;

            it('reverts', async function () {
                await assertRevert(this.gigBlack.transfer(to, 100, { from: CA }));
            });
        });
    });


    /*****************************************************************************
     * Test ownership
     *****************************************************************************/
    describe('ownership', function () {
        it('should have an owner and owner is CA', async function () {
            let owner = await this.gigBlack.owner();
            assert.isTrue(owner !== 0);
            assert.isTrue(owner === CA);
        });

        it('changes owner after transfer', async function () {
            let other = recipient;
            await this.gigBlack.transferOwnership(other);
            let owner = await this.gigBlack.owner();

            assert.isTrue(owner === other);
        });

        it('should prevent non-owners from transfering', async function () {
            const other = recipient;
            const owner = await this.gigBlack.owner.call();
            assert.isTrue(owner === CA);
            await assertRevert(this.gigBlack.transferOwnership(other, { from: other }));
        });

        it('should guard ownership against stuck state', async function () {
            let originalOwner = await this.gigBlack.owner();
            await assertRevert(this.gigBlack.transferOwnership(null, { from: originalOwner }));
        });
    });

    /*****************************************************************************
     * Test burnable
     *****************************************************************************/
    describe('burnable', function () {
        const from = CA;

        describe('when the given amount is not greater than balance of the sender', function () {
            const amount = getBigNumberTokens(100, _decimals);

            it('burns the requested amount', async function () {
                await this.gigBlack.burn(amount, { from });

                const balance = await this.gigBlack.balanceOf(from);
                balance.should.be.bignumber.equal(_totalSupply.sub(amount) );
            });

            it('changes total supply', async function () {
                await this.gigBlack.burn(amount, { from });

                const totalSupply = await this.gigBlack.totalSupply();
                totalSupply.should.be.bignumber.equal(_totalSupply.sub(amount) );
            });
            
            
            it('emits a burn event', async function () {
                const { logs } = await this.gigBlack.burn(amount, { from });

                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'Burn');
                assert.equal(logs[0].args.burner, CA);
                logs[0].args.value.should.be.bignumber.equal(amount);
            });


            it('handles correctly 0 amount', async function () {
                await assertRevert(this.gigBlack.burn(0, { from }));
            });
            
        });

        describe('when the given amount is greater than the balance of the sender', function () {
            
            it('reverts', async function () {
                const biggerAmount = _totalSupply.add(1);
                await assertRevert(this.gigBlack.burn(biggerAmount, { from })); 
            });
            
        });
    });


    /*******************************************************************
     * Test StandardToken Approve function
     ******************************************************************/
    describe('approve', function () {
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                const amount = 100;

                it('emits an approval event', async function () {
                    const { logs } = await this.gigBlack.approve(spender, amount, { from: CA });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, CA);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(amount));
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.gigBlack.approve(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        assert.equal(allowance, amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.gigBlack.approve(spender, 1, { from: CA });
                    });

                    it('approves the requested amount and replaces the previous one', async function () {
                        await this.gigBlack.approve(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        assert.equal(allowance, amount);
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = _totalSupply.add(1);

                it('emits an approval event', async function () {
                    const { logs } = await this.gigBlack.approve(spender, amount, { from: CA });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, CA);
                    assert.equal(logs[0].args.spender, spender);
                    logs[0].args.value.should.be.bignumber.equal(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.gigBlack.approve(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.gigBlack.approve(spender, 1, { from: CA });
                    });

                    it('approves the requested amount and replaces the previous one', async function () {
                        await this.gigBlack.approve(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const amount = 100;
            const spender = ZERO_ADDRESS;

            it('approves the requested amount', async function () {
                await this.gigBlack.approve(spender, amount, { from: CA });

                const allowance = await this.gigBlack.allowance(CA, spender);
                assert.equal(allowance, amount);
            });

            it('emits an approval event', async function () {
                const { logs } = await this.gigBlack.approve(spender, amount, { from: CA });

                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'Approval');
                assert.equal(logs[0].args.owner, CA);
                assert.equal(logs[0].args.spender, spender);
                assert(logs[0].args.value.eq(amount));
            });
        });
    });

    describe('transfer from', function () {
        const spender = recipient;
        const amount = _totalSupply;
        
        describe('when the recipient is not the zero address', function () {
            const to = recipient2;

            describe('when the spender has enough approved balance', function () {
                beforeEach(async function () {
                    // allow all amount
                    await this.gigBlack.approve(spender, amount, { from: CA });
                });

                describe('when the owner has enough balance', function () {

                    it('transfers the requested amount', async function () {
                        await this.gigBlack.transferFrom(CA, to, amount, { from: spender });

                        const senderBalance = await this.gigBlack.balanceOf(CA);
                        assert.equal(senderBalance, 0);

                        const recipientBalance = await this.gigBlack.balanceOf(to);
                        recipientBalance.should.be.bignumber.equal(amountWithoutFee(amount));
                    });

                    it('decreases the spender allowance', async function () {
                        await this.gigBlack.transferFrom(CA, to, amount, { from: spender });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        assert(allowance.eq(0));
                    });

                    it('emits a transfer event', async function () {
                        const { logs } = await this.gigBlack.transferFrom(CA, to, amount, { from: spender });

                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'Transfer');
                        assert.equal(logs[0].args.from, CA);
                        assert.equal(logs[0].args.to, to);
                        logs[0].args.value.should.be.bignumber.equal(amount);
                    });
                });

                describe('when the owner does not have enough balance', function () {
                    const amount = _totalSupply.add(1);

                    it('reverts', async function () {
                        await assertRevert(this.gigBlack.transferFrom(CA, to, amount, { from: spender }));
                    });
                });
            });

            describe('when the spender does not have enough approved balance', function () {
                beforeEach(async function () {
                    await this.gigBlack.approve(spender, amount.sub(1), { from: CA });
                });

                describe('when the owner has enough balance', function () {

                    it('reverts', async function () {
                        await assertRevert(this.gigBlack.transferFrom(CA, to, amount, { from: spender }));
                    });
                });

                describe('when the owner does not have enough balance', function () {
                    const amount = _totalSupply.add(1);

                    it('reverts', async function () {
                        await assertRevert(this.gigBlack.transferFrom(CA, to, amount, { from: spender }));
                    });
                });
            });
        });

        describe('when the recipient is the zero address', function () {
            const to = ZERO_ADDRESS;

            beforeEach(async function () {
                await this.gigBlack.approve(spender, amount, { from: CA });
            });

            it('reverts', async function () {
                await assertRevert(this.gigBlack.transferFrom(CA, to, amount, { from: spender }));
            });
        });
    });

    describe('decrease approval', function () {
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                const amount = _totalSupply;

                it('emits an approval event', async function () {
                    const { logs } = await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, CA);
                    assert.equal(logs[0].args.spender, spender);
                    logs[0].args.value.should.be.bignumber.equal(0);
                });

                describe('when there was no approved amount before', function () {
                    it('keeps the allowance to zero', async function () {
                        await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        assert.equal(allowance, 0);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.gigBlack.approve(spender, amount.add(1), { from: CA });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        assert.equal(allowance, 1);
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = _totalSupply.add(1);

                it('emits an approval event', async function () {
                    const { logs } = await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, CA);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(0));
                });

                describe('when there was no approved amount before', function () {
                    it('keeps the allowance to zero', async function () {
                        await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        assert.equal(allowance, 0);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.gigBlack.approve(spender, amount.add(1), { from: CA });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        assert.equal(allowance, 1);
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const amount = _totalSupply;
            const spender = ZERO_ADDRESS;

            it('decreases the requested amount', async function () {
                await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                const allowance = await this.gigBlack.allowance(CA, spender);
                assert.equal(allowance, 0);
            });

            it('emits an approval event', async function () {
                const { logs } = await this.gigBlack.decreaseApproval(spender, amount, { from: CA });

                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'Approval');
                assert.equal(logs[0].args.owner, CA);
                assert.equal(logs[0].args.spender, spender);
                assert(logs[0].args.value.eq(0));
            });
        });
    });

    describe('increase approval', function () {
        const amount = _totalSupply;

        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    const { logs } = await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, CA);
                    assert.equal(logs[0].args.spender, spender);
                    logs[0].args.value.should.be.bignumber.equal(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.gigBlack.approve(spender, 1, { from: CA });
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        allowance.should.be.bignumber.equal(amount.add(1));
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = _totalSupply.add(1);

                it('emits an approval event', async function () {
                    const { logs } = await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, CA);
                    assert.equal(logs[0].args.spender, spender);
                    logs[0].args.value.should.be.bignumber.equal(amount);
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        allowance.should.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.gigBlack.approve(spender, 1, { from: CA });
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                        const allowance = await this.gigBlack.allowance(CA, spender);
                        allowance.should.be.bignumber.equal(amount.add(1));
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const spender = ZERO_ADDRESS;

            it('approves the requested amount', async function () {
                await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                const allowance = await this.gigBlack.allowance(CA, spender);
                allowance.should.be.bignumber.equal(amount);
            });

            it('emits an approval event', async function () {
                const { logs } = await this.gigBlack.increaseApproval(spender, amount, { from: CA });

                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'Approval');
                assert.equal(logs[0].args.owner, CA);
                assert.equal(logs[0].args.spender, spender);
                logs[0].args.value.should.be.bignumber.equal(amount);
            });
        });
    });

    /*****************************************************************************
     * Test setFeeEnable
     *****************************************************************************/
    describe('feeEnable', function () {
        it('should be false on construction', async function () {
            let feeEnabled = await this.gigBlack.feeEnabled();
            assert.isTrue(feeEnabled);
        });

        it('owner can change feeEnabled', async function () {
            await this.gigBlack.setFeeEnabled(false);
            let feeEnabled = await this.gigBlack.feeEnabled();
            assert.isFalse(feeEnabled);
        });
        
        it('only owner can change', async function () {
            await assertRevert(this.gigBlack.setFeeEnabled(false, {from: someInvestor}));
            let feeEnabled = await this.gigBlack.feeEnabled();
            assert.isTrue(feeEnabled);            
        });
        
    });    
    

});

