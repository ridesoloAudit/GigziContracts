const GigGold = artifacts.require("./GigGold.sol");

contract('GigGold tests', function([CA, feeCollector]) {

    const _name = 'GigziGold';
    const _symbol = 'GZG';
    const _decimals = 18;

    
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';


    beforeEach(async function () {
        this.gigGold = await GigGold.new(feeCollector);
    });

    it('has a name', async function () {
        const name = await this.gigGold.name();
        name.should.be.equal(_name);
    });

    it('has a symbol', async function () {
        const symbol = await this.gigGold.symbol();
        symbol.should.be.equal(_symbol);
    });
});