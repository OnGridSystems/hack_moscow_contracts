const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require('openzeppelin-test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const DeliveryEscrow = artifacts.require('DeliveryEscrow');
const StableCoin = artifacts.require('StableCoin');

contract('DeliveryEscrow', function (
  [carrier, platform, stableCoinMinter]
) {
  beforeEach(async function () {
    this.stableCoin = await StableCoin.new({ from: stableCoinMinter });
  });

  describe('test DeliveryEscrow constructor', function () {
    beforeEach(async function () {
      this.escrow = await DeliveryEscrow.new(
        this.stableCoin.address, { from: platform }
      );
      await this.stableCoin.mint(
        carrier, new BN('100'), { from: stableCoinMinter }
      );
    });
    it('token is correct', async function () {
      expect(await this.escrow.token()).to.be.equal(this.stableCoin.address);
    });
    it('platfrom owns escrow', async function () {
      expect(await this.escrow.owner()).to.be.equal(platform);
    });

    describe('test addFunds', function () {
      beforeEach(async function () {
        await this.stableCoin.approve(
          this.escrow.address, new BN('100'), { from: carrier }
        );
      });
      it('can\'t add funds to ZERO_ADDRESS', async function () {
        await expectRevert(
          this.escrow.addFunds(
            ZERO_ADDRESS, new BN('100'), { from: platform }
          ),
          'Wrong address'
        );
      });
      it('can\'t add zero funds', async function () {
        await expectRevert(
          this.escrow.addFunds(carrier, new BN('0'), { from: platform }),
          'Amount is zero'
        );
      });
      it('can\'t add more than allowed', async function () {
        await expectRevert(
          this.escrow.addFunds(carrier, new BN('101'), { from: platform }),
          'Amount exceed carrier allowance'
        );
      });
      it('can add allowed amount', async function () {
        expect(await this.escrow.totalFunds(carrier))
          .to.be.bignumber.equal(new BN('0'));
        ({logs: this.logs } = await this.escrow.addFunds(
          carrier, new BN('100'), { from: platform }
        ));
        expectEvent.inLogs(this.logs, 'FundsAdded');
        expect(await this.escrow.totalFunds(carrier))
          .to.be.bignumber.equal(new BN('100'));
      });
    });

    describe('test lockedFunds', function () {
      beforeEach(async function () {
        await this.stableCoin.approve(
          this.escrow.address, new BN('100'), { from: carrier }
        );
        await this.escrow.addFunds(
          carrier, new BN('100'), { from: platform }
        );
      });
      it('can\'t lock zero funds', async function () {
        await expectRevert(
          this.escrow.lockFunds(carrier, new BN('0'), { from: platform }),
          'Amount is zero'
        );
      });
      it('can\'t lock more than on balance', async function () {
        await expectRevert(
          this.escrow.lockFunds(carrier, new BN('101'), { from: platform }),
          'Amount exceed carrier balance'
        );
      });
      it('can lock available balance', async function () {
        expect(await this.escrow.lockedFunds(carrier))
          .to.be.bignumber.equal(new BN('0'));
        expect(await this.escrow.totalFunds(carrier))
          .to.be.bignumber.equal(new BN('100'));
        ({ logs: this.logs } = await this.escrow.lockFunds(
          carrier, new BN('100'), { from: platform }
        ));
        expectEvent.inLogs(this.logs, 'FundsLocked');
        expect(await this.escrow.lockedFunds(carrier))
          .to.be.bignumber.equal(new BN('100'));
        expect(await this.escrow.totalFunds(carrier))
          .to.be.bignumber.equal(new BN('100'));
      });
    });

    describe('test unlockFunds', function () {
      beforeEach(async function () {
        await this.stableCoin.approve(
          this.escrow.address, new BN('100'), { from: carrier }
        );
        await this.escrow.addFunds(
          carrier, new BN('100'), { from: platform }
        );
        await this.escrow.lockFunds(
          carrier, new BN('100'), { from: platform }
        )
      });
      it('can\'t unlock zero funds', async function () {
        await expectRevert(
          this.escrow.unlockFunds(
            carrier, new BN('0'), { from: platform }
          ),
          'Amount is zero'
        );
      });
      it('can\'t unlock more than locked', async function () {
        await expectRevert(
          this.escrow.unlockFunds(
            carrier, new BN('101'), { from: platform }
          ),
          'Amount exceed carrier locked funds'
        );
      });
      it('can unlock locked balance', async function () {
        expect(await this.escrow.lockedFunds(carrier))
          .to.be.bignumber.equal(new BN('100'));
        expect(await this.escrow.totalFunds(carrier))
          .to.be.bignumber.equal(new BN('100'));
        ({ logs: this.logs } = await this.escrow.unlockFunds(
          carrier, new BN('100'), { from: platform }
        ));
        expectEvent.inLogs(this.logs, 'FundsUnlocked');
        expect(await this.escrow.lockedFunds(carrier))
          .to.be.bignumber.equal(new BN('0'));
        expect(await this.escrow.totalFunds(carrier))
          .to.be.bignumber.equal(new BN('100'));
      });
    });
  });
});
