const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require('openzeppelin-test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const Token = artifacts.require('StableCoin');

contract('StableCoin', function ([owner, account]) {
  beforeEach(async function () {
    this.token = await Token.new();
  });

  describe('test token initialization', function () {
    it('token name', async function () {
      expect(await this.token.name()).to.be.equal('StableCoin');
    });
    it('token symbol', async function () {
      expect(await this.token.symbol()).to.be.equal('STC');
    });
    it('token symbol', async function () {
      expect(await this.token.decimals()).to.be.bignumber.equal(new BN('8'));
    });
    it('totalSupply is zero', async function () {
      expect(await this.token.totalSupply()).to.be.bignumber.equal(new BN('0'));
    });
    it('balanceOf returns zeros', async function () {
      expect(await this.token.balanceOf(owner))
        .to.be.bignumber.equal(new BN('0'));
      expect(await this.token.balanceOf(account))
        .to.be.bignumber.equal(new BN('0'));
    });
    it('allowance returns zeros', async function () {
      expect(await this.token.allowance(owner, account))
        .to.be.bignumber.equal(new BN('0'));
      expect(await this.token.allowance(account, owner))
        .to.be.bignumber.equal(new BN('0'));
    });
  });

  describe('test approve', function () {
    beforeEach(async function () {
      this.initialAmount = new BN('10');
      await this.token.mint(owner, this.initialAmount);
    });
    it('cant allow ZERO_ADDRESS to spend tokens', async function () {
      await expectRevert.unspecified(
        this.token.approve(ZERO_ADDRESS, this.initialAmount)
      );
    });
    it('share some tokens', async function () {
      expect(await this.token.allowance(owner, account))
        .to.be.bignumber.equal(new BN('0'));
      const { logs } = await this.token.approve(account, this.initialAmount);
      expectEvent.inLogs(
        logs, 'Approval', {
          owner: owner,
          spender: account,
          value: this.initialAmount,
        });
      expect(await this.token.allowance(owner, account))
        .to.be.bignumber.equal(this.initialAmount);
    });
  });

  describe('test increaseAllowance', function () {
    beforeEach(async function () {
      this.initialAmount = new BN('10');
      await this.token.mint(owner, this.initialAmount);
    });
    it('increase amount of shared tokens', async function () {
      const amount = new BN('4');
      await this.token.approve(account, amount);
      const { logs } = await this.token.increaseAllowance(
        account, this.initialAmount.sub(amount)
      );
      expectEvent.inLogs(
        logs, 'Approval', {
          owner: owner,
          spender: account,
          value: this.initialAmount,
        }
      );
      expect(await this.token.allowance(owner, account))
        .to.be.bignumber.equal(this.initialAmount);
    });
  });

  describe('test decreaseAllowance', function () {
    beforeEach(async function () {
      this.initialAmount = new BN('10');
      await this.token.mint(owner, this.initialAmount);
    });
    it('decrease amount of shared tokens', async function () {
      const amount = new BN('4');
      await this.token.approve(account, this.initialAmount);
      const { logs } = await this.token.decreaseAllowance(account, amount);
      expectEvent.inLogs(
        logs, 'Approval', {
          owner: owner,
          spender: account,
          value: this.initialAmount.sub(amount),
        }
      );
      expect(await this.token.allowance(owner, account))
        .to.be.bignumber.equal(this.initialAmount.sub(amount));
    });
  });

  describe('test transfer', function () {
    beforeEach(async function () {
      this.initialAmount = new BN('10');
      await this.token.mint(owner, this.initialAmount);
    });
    it('transfer some tokens', async function () {
      const amount = new BN('4');
      const { logs } = await this.token.transfer(account, amount);
      expectEvent.inLogs(
        logs, 'Transfer', {
          from: owner,
          to: account,
          value: amount,
        }
      );
      expect(await this.token.balanceOf(account))
        .to.be.bignumber.equal(amount);
      expect(await this.token.balanceOf(owner))
        .to.be.bignumber.equal(this.initialAmount.sub(amount));
    });
  });

  describe('test transferFrom', function () {
    beforeEach(async function () {
      this.initialAmount = new BN('10');
      await this.token.mint(owner, this.initialAmount);
    });
    it('transfer some allowed tokens from other account', async function () {
      await this.token.approve(account, this.initialAmount);
      const { logs } = await this.token.transferFrom(
        owner,
        account,
        this.initialAmount,
        { from: account }
      );
      expectEvent.inLogs(
        logs, 'Transfer', {
          from: owner,
          to: account,
          value: this.initialAmount,
        }
      );
      expect(await this.token.allowance(owner, account))
        .to.be.bignumber.equal(new BN('0'));
      expect(await this.token.balanceOf(account))
        .to.be.bignumber.equal(this.initialAmount);
    });
  });

  describe('test token minting', function () {
    it('cant mint to ZERO_ADDRESS', async function () {
      await expectRevert.unspecified(
        this.token.mint(ZERO_ADDRESS, new BN('10'))
      );
    });
    it('cant mint 0 tokens', async function () {
      await expectRevert.unspecified(
        this.token.mint(owner, new BN('0'))
      );
    });
    it('mint to some account', async function () {
      const amount = new BN('10');
      await this.token.mint(owner, amount);
      expect(await this.token.totalSupply()).to.be.bignumber.equal(amount);
      expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(amount);
    });
  });

  describe('test token burning', function () {
    beforeEach(async function () {
      this.initialAmount = new BN('10');
      await this.token.mint(owner, this.initialAmount);
    });
    it('burn some tokens', async function () {
      const amount = new BN('4');
      await this.token.burn(amount);
      expect(await this.token.totalSupply()).to.be.bignumber.equal(
        this.initialAmount.sub(amount)
      );
      expect(await this.token.balanceOf(owner))
        .to.be.bignumber.equal(this.initialAmount.sub(amount));
    });
  });

  describe('test burnFrom', function () {
    beforeEach(async function () {
      this.initialAmount = new BN('10');
      await this.token.mint(owner, this.initialAmount);
    });
    it('burn some shared tokens', async function () {
      await this.token.approve(account, this.initialAmount);
      const { logs } = await this.token.burnFrom(
        owner,
        this.initialAmount,
        { from: account }
      );
      expectEvent.inLogs(
        logs, 'Transfer', {
          from: owner,
          to: ZERO_ADDRESS,
          value: this.initialAmount,
        }
      );
      expectEvent.inLogs(
        logs, 'Approval', {
          owner: owner,
          spender: account,
          value: new BN('0'),
        }
      );
      expect(await this.token.balanceOf(owner))
        .to.be.bignumber.equal(new BN('0'));
      expect(await this.token.allowance(owner, account))
        .to.be.bignumber.equal(new BN('0'));
    });
  });
});
