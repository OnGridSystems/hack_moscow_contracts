const {
  BN,
  constants,
  expectRevert,
  time,
} = require('openzeppelin-test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const DeliveryEscrow = artifacts.require('DeliveryEscrow');
const Token = artifacts.require('StableCoin');

contract('DeliveryEscrow', function ([owner, investor, otherAcct]) {
  // Advance to the next block to correctly read time
  // in the solidity "now" function interpreted by ganache
  before(async function () {
    await time.advanceBlock();
  });

  beforeEach(async function () {
    this.token = await Token.new();
  });

  describe('test addBalance basic checks', function () {
    beforeEach(async function () {
      this.keeper = await DeliveryEscrow.new(
        this.token.address, this.startUnfreeze, this.totalUnfreeze
      );
      await this.token.mint(this.keeper.address, new BN('10'));
    });
    it('cant add balance to ZERO_ADDRESS', async function () {
      await expectRevert.unspecified(this.keeper.addBalance(ZERO_ADDRESS, new BN('10')));
    });
    it('cant increase balance on 0', async function () {
      await expectRevert.unspecified(this.keeper.addBalance(investor, new BN('0')));
    });
    it('should be enougn unoccupied tokens', async function () {
      await expectRevert.unspecified(this.keeper.addBalance(investor, new BN('20')));
    });
  });

  describe('test withdraw basic checks', function () {
    beforeEach(async function () {
      this.keeper = await DeliveryEscrow.new(
        this.token.address, this.startUnfreeze, this.totalUnfreeze
      );
      await this.token.mint(this.keeper.address, new BN('10'));
      await this.keeper.addBalance(investor, new BN('10'));
    });
    it('cant withdraw to ZERO_ADDRESS', async function () {
      await expectRevert.unspecified(
        this.keeper.withdraw(ZERO_ADDRESS, new BN('10'), { from: investor })
      );
    });
    it('cant withdraw 0 tokens', async function () {
      await expectRevert.unspecified(
        this.keeper.withdraw(otherAcct, new BN('0'), { from: investor })
      );
    });
  });

  describe('all funds are frozen yet', function () {
    beforeEach(async function () {
      this.keeper = await DeliveryEscrow.new(
        this.token.address, this.startUnfreeze, this.totalUnfreeze
      );
      await this.token.mint(this.keeper.address, new BN('500'));
      await this.keeper.addBalance(investor, new BN('123'));
    });
    describe('test getUnfrozenAmount', function () {
      it('no unfrozen funds', async function () {
        expect(await this.keeper.getUnfrozenAmount(investor))
          .to.be.bignumber.equal(new BN('0'));
        expect(await this.keeper.getUnfrozenAmount(otherAcct))
          .to.be.bignumber.equal(new BN('0'));
      });
    });
    describe('test withdraw', function () {
      it('unable to withdraw frozen funds', async function () {
        await expectRevert.unspecified(
          this.keeper.withdraw(otherAcct, new BN('12'), { from: investor })
        );
      });
    });
  });

  describe('funds are partially unfrozen', function () {
    let unfrozen;
    beforeEach(async function () {
      this.keeper = await DeliveryEscrow.new(
        this.token.address, this.startUnfreeze, this.totalUnfreeze
      );
      await this.token.mint(this.keeper.address, new BN('1234567890'));
      await this.keeper.addBalance(investor, new BN('1234567890'));
      await time.increaseTo(this.afterStartUnfreeze);
    });
    describe('test getUnfrozenAmount', function () {
      it('some funds are accessible', async function () {
        unfrozen = await this.keeper.getUnfrozenAmount(investor);
        // tolerance to small time fluctuations
        expect(unfrozen).to.be.bignumber.that.is.at.least(new BN('7348618'));
        expect(unfrozen).to.be.bignumber.that.is.at.most(new BN('7350659'));
      });
    });
    describe('test withdraw', function () {
      it('unable to withdraw more than unfrozen funds', async function () {
        await expectRevert.unspecified(
          this.keeper.withdraw(
            otherAcct, new BN('7350660'), { from: investor }
          )
        );
      });
      it('able to withdraw all unfrozen funds at once', async function () {
        await this.keeper.withdraw(
          otherAcct, new BN('7348618'), { from: investor }
        );
      });
      it('able to withdraw all unfrozen funds by multiple transactions',
        async function () {
          unfrozen = await this.keeper.getUnfrozenAmount(investor);
          expect(unfrozen).to.be.bignumber.that.is.at.least(new BN('7348618'));
          expect(unfrozen).to.be.bignumber.that.is.at.most(new BN('7350659'));
          expect(await this.keeper.balances(investor))
            .to.be.bignumber.equal(new BN('1234567890'));
          expect(await this.keeper.withdrawnBalances(investor))
            .to.be.bignumber.equal(new BN('0'));
          await this.keeper.withdraw(
            otherAcct, new BN('2449539'), { from: investor }
          );
          unfrozen = await this.keeper.getUnfrozenAmount(investor);
          expect(unfrozen).to.be.bignumber.that.is.at.least(new BN('7348618'));
          expect(unfrozen).to.be.bignumber.that.is.at.most(new BN('7350659'));
          expect(await this.keeper.balances(investor))
            .to.be.bignumber.equal(new BN('1234567890'));
          expect(await this.keeper.withdrawnBalances(investor))
            .to.be.bignumber.equal(new BN('2449539'));
          await this.keeper.withdraw(
            otherAcct, new BN('2449539'), { from: investor }
          );
          unfrozen = await this.keeper.getUnfrozenAmount(investor);
          expect(unfrozen).to.be.bignumber.that.is.at.least(new BN('7348618'));
          expect(unfrozen).to.be.bignumber.that.is.at.most(new BN('7350659'));
          expect(await this.keeper.balances(investor))
            .to.be.bignumber.equal(new BN('1234567890'));
          expect(await this.keeper.withdrawnBalances(investor))
            .to.be.bignumber.equal(new BN('4899078'));
          await this.keeper.withdraw(
            otherAcct, new BN('2449540'), { from: investor }
          );
          unfrozen = await this.keeper.getUnfrozenAmount(investor);
          expect(unfrozen).to.be.bignumber.that.is.at.least(new BN('7348618'));
          expect(unfrozen).to.be.bignumber.that.is.at.most(new BN('7350659'));
          expect(await this.keeper.balances(investor))
            .to.be.bignumber.equal(new BN('1234567890'));
          expect(await this.keeper.withdrawnBalances(investor))
            .to.be.bignumber.equal(new BN('7348618'));
        }
      );
      it('unable to withdraw any more without waiting', async function () {
        await this.keeper.withdraw(
          otherAcct, new BN('7348618'), { from: investor }
        );
        await expectRevert.unspecified(
          this.keeper.withdraw(otherAcct, new BN('2042'), { from: investor })
        );
      });
      it('but can withdraw some after small wait', async function () {
        await this.keeper.withdraw(
          otherAcct, new BN('7348618'), { from: investor }
        );
        await time.increase(time.duration.hours(1));
        await this.keeper.withdraw(
          otherAcct, new BN('2042'), { from: investor }
        );
      });
    });
  });

  describe('funds totally unfrozen', function () {
    beforeEach(async function () {
      this.keeper = await DeliveryEscrow.new(
        this.token.address, this.startUnfreeze, this.totalUnfreeze
      );
      await this.token.mint(this.keeper.address, new BN('500'));
      await this.keeper.addBalance(investor, new BN('123'));
      await time.increaseTo(this.afterTotalUnfreeze);
    });
    describe('test getUnfrozenAmount', function () {
      it('can withdrawal funds within balance', async function () {
        expect(await this.keeper.getUnfrozenAmount(investor))
          .to.be.bignumber.equal(new BN('123'));
        expect(await this.keeper.getUnfrozenAmount(otherAcct))
          .to.be.bignumber.equal(new BN('0'));
      });
    });
    describe('test withdraw', function () {
      it('able to withdraw within balance at once', async function () {
        await this.keeper.withdraw(
          otherAcct, new BN('123'), { from: investor }
        );
      });
      it('able to withdraw within balance by multiple transactions',
        async function () {
          expect(await this.keeper.getUnfrozenAmount(investor))
            .to.be.bignumber.equal(new BN('123'));
          expect(await this.keeper.balances(investor))
            .to.be.bignumber.equal(new BN('123'));
          expect(await this.keeper.withdrawnBalances(investor))
            .to.be.bignumber.equal(new BN('0'));
          await this.keeper.withdraw(
            otherAcct, new BN('60'), { from: investor }
          );
          expect(await this.keeper.getUnfrozenAmount(investor))
            .to.be.bignumber.equal(new BN('123'));
          expect(await this.keeper.balances(investor))
            .to.be.bignumber.equal(new BN('123'));
          expect(await this.keeper.withdrawnBalances(investor))
            .to.be.bignumber.equal(new BN('60'));
          await this.keeper.withdraw(
            otherAcct, new BN('63'), { from: investor }
          );
          expect(await this.keeper.getUnfrozenAmount(investor))
            .to.be.bignumber.equal(new BN('123'));
          expect(await this.keeper.balances(investor))
            .to.be.bignumber.equal(new BN('123'));
          expect(await this.keeper.withdrawnBalances(investor))
            .to.be.bignumber.equal(new BN('123'));
        }
      );
      it('unable to withdraw more than balance', async function () {
        await expectRevert.unspecified(
          this.keeper.withdraw(otherAcct, new BN('124'), { from: investor })
        );
      });
    });
  });
});
