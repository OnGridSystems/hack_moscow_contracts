const {
  BN,
  constants,
  expectRevert
} = require('openzeppelin-test-helpers');
const { ZERO_ADDRESS } = constants;

const DeliveryEscrow = artifacts.require('DeliveryEscrow');
const StableCoin = artifacts.require('StableCoin');

contract('DeliveryEscrow', function ([shipper, carrier, platform, stableCoinMinter]) {

  beforeEach(async function () {
    this.stableCoin = await StableCoin.new({ from: stableCoinMinter });
  });

  describe('test initial state', function () {
    beforeEach(async function () {
      this.escrow = await DeliveryEscrow.new(
        this.stableCoin.address, { from: platform }
      );
      await this.stableCoin.mint(shipper, new BN('100'), { from: stableCoinMinter });
      await this.stableCoin.mint(carrier, new BN('100'), { from: stableCoinMinter });
    });
    it('token is correct', async function () {
      expect(await this.escrow.token()).to.be.equal(this.stableCoin.address);
    });
  });
});
