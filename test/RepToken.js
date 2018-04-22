const {EVMThrow} = require('./helpers');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const LegacyRepToken = artifacts.require('LegacyRepToken');
const RepToken = artifacts.require('RepToken');
const InitializableTester = artifacts.require('InitializableTester');

contract('RepToken', function ([_, owner, zeroHolder, nonZeroHolder1, nonZeroHolder2, freezer]) {

  const nonZeroAmount1 = new BigNumber(4000);
  const nonZeroAmount2 = new BigNumber(8000);
  const transferredAmount = new BigNumber(1000);
  const totalAmount = nonZeroAmount1.plus(nonZeroAmount2);
  const amountUsedToFreeze = new BigNumber(10);

  describe('constants', function () {
    beforeEach(async function () {
      const legacyRep = await LegacyRepToken.new();
      this.rep = await RepToken.new(legacyRep.address, amountUsedToFreeze, nonZeroHolder1, {from: owner});
    });

    it('should define decimals', async function () {
      this.rep.decimals().then(decimals => {
        decimals.should.bignumber.equal(18);
      });
    });

    it('should define name', async function () {
      this.rep.name().then(name => {
        name.should.equal('Reputation');
      });
    });

    it('should define symbol', async function () {
      this.rep.symbol().then(symbol => {
        symbol.should.equal('REP');
      });
    });
  });

  describe('one holder', function () {

    beforeEach(async function () {
      const legacyRep = await LegacyRepToken.new();
      await legacyRep.assign(freezer, amountUsedToFreeze);
      await legacyRep.assign(nonZeroHolder1, nonZeroAmount1);
      await legacyRep.freeze(freezer, amountUsedToFreeze);
      this.rep = await RepToken.new(legacyRep.address, amountUsedToFreeze, freezer, {from: owner});
      this.targetTotalSupply = amountUsedToFreeze.add(nonZeroAmount1);
    });

    it('should migrate nonzero balance', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});

      await this.rep.initialized().should.eventually.equal(true);
      await this.rep.balanceOf(nonZeroHolder1).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount1);
      });
      await this.rep.balanceOf(freezer).then(balance => {
        balance.should.bignumber.equal(amountUsedToFreeze);
      });
      await this.rep.totalSupply().then(totalSupply => {
        totalSupply.should.bignumber.equal(this.targetTotalSupply);
      });
    });

    it('should not migrate extra balance', async function () {
      await this.rep.migrateBalances([zeroHolder, nonZeroHolder1], {from: owner});

      await this.rep.balanceOf(zeroHolder, {from: owner}).then(balance => {
        balance.should.bignumber.equal(0);
      });

      await this.rep.totalSupply().then(totalSupply => {
        totalSupply.should.bignumber.equal(this.targetTotalSupply);
      });
    });

    it('should not allow migration after initialized', async function () {
      await this.rep.initialized().should.eventually.equal(false);
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.initialized().should.eventually.equal(true);
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner}).should.be.rejectedWith(EVMThrow);
    });

    it('should not allow unpause before complete', async function () {
      await this.rep.unpause({from: owner}).should.be.rejectedWith(EVMThrow);

      await this.rep.totalSupply().then(totalSupply => {
        totalSupply.should.bignumber.equal(amountUsedToFreeze);
      });
    });

    it('should not allow to transfer before unpause', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.transfer(zeroHolder, transferredAmount, {from: nonZeroHolder1}).should.be.rejectedWith(EVMThrow);
    });

    it('should not allow to transferFrom before unpause', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await (this.rep.approve(zeroHolder, transferredAmount, {from: nonZeroHolder1}));
      await this.rep.transfer(zeroHolder, transferredAmount, {from: nonZeroHolder1}).should.be.rejectedWith(EVMThrow);
    });

    it('should allow to transfer after unpause', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.unpause({from: owner});

      await (this.rep.transfer(zeroHolder, transferredAmount, {from: nonZeroHolder1}));

      await this.rep.balanceOf(zeroHolder).then(balance => {
        balance.should.bignumber.equal(transferredAmount);
      });

      await this.rep.balanceOf(nonZeroHolder1).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount1.sub(transferredAmount));
      });
    });

    it('should not allow to migrate after unpause', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.unpause({from: owner});

      await this.rep.migrateBalances([nonZeroHolder1], {from: owner}).should.be.rejectedWith(EVMThrow);
      await this.rep.migrateBalance(nonZeroHolder1, {from: owner}).should.be.rejectedWith(EVMThrow);
    });

    it('should retain owner after unpause', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.unpause({from: owner});
      await this.rep.owner().then(owner => {
        owner.should.eq(owner);
      });
    });

  });

  describe('multiple holders', function () {

    beforeEach(async function () {
      const legacyRep = await LegacyRepToken.new();
      await legacyRep.assign(freezer, amountUsedToFreeze);
      await legacyRep.assign(nonZeroHolder1, nonZeroAmount1);
      await legacyRep.assign(nonZeroHolder2, nonZeroAmount2);
      await legacyRep.freeze(freezer, amountUsedToFreeze);
      this.rep = await RepToken.new(legacyRep.address, amountUsedToFreeze, freezer, {from: owner});
      this.targetTotalSupply = amountUsedToFreeze.add(nonZeroAmount1).add(nonZeroAmount2);
    });

    it('should migrate all nonzero balances', async function () {
      await this.rep.migrateBalances([nonZeroHolder1, nonZeroHolder2], {from: owner});

      await this.rep.balanceOf(nonZeroHolder1, {from: owner}).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount1);
      });

      await this.rep.balanceOf(nonZeroHolder2, {from: owner}).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount2);
      });

      await this.rep.totalSupply().then(totalSupply => {
        totalSupply.should.bignumber.equal(this.targetTotalSupply);
      });
    });

    it('should migrate all nonzero balances in multiple migrations', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.migrateBalances([nonZeroHolder2], {from: owner});

      await this.rep.balanceOf(nonZeroHolder1, {from: owner}).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount1);
      });

      await this.rep.balanceOf(nonZeroHolder2, {from: owner}).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount2);
      });

      await this.rep.totalSupply().then(totalSupply => {
        totalSupply.should.bignumber.equal(this.targetTotalSupply);
      });
    });

    it('should not migrate balance twice in same migration', async function () {
      await this.rep.migrateBalances([nonZeroHolder1, nonZeroHolder1, nonZeroHolder2], {from: owner});

      await this.rep.balanceOf(nonZeroHolder1, {from: owner}).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount1);
      });

      await this.rep.totalSupply().then(totalSupply => {
        totalSupply.should.bignumber.equal(this.targetTotalSupply);
      });
    });

    it('should not migrate balance twice in different migrations', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.migrateBalances([nonZeroHolder1, nonZeroHolder2], {from: owner});
      await this.rep.unpause({from: owner});

      await this.rep.balanceOf(nonZeroHolder1, {from: owner}).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount1);
      });

      await this.rep.totalSupply().then(totalSupply => {
        totalSupply.should.bignumber.equal(this.targetTotalSupply);
      });
    });

    it('should not finish migration before complete', async function () {
      await this.rep.migrateBalances([nonZeroHolder1], {from: owner});
      await this.rep.unpause({from: owner}).should.be.rejectedWith(EVMThrow);
    });

    it('should allow to transferFrom after unpause', async function () {
      await this.rep.migrateBalances([nonZeroHolder1, nonZeroHolder2], {from: owner});
      await this.rep.unpause({from: owner});

      await (this.rep.approve(zeroHolder, transferredAmount, {from: nonZeroHolder1}));
      await (this.rep.transferFrom(nonZeroHolder1, zeroHolder, transferredAmount, {from: zeroHolder}));

      await this.rep.balanceOf(zeroHolder).then(balance => {
        balance.should.bignumber.equal(transferredAmount);
      });

      await this.rep.balanceOf(nonZeroHolder1).then(balance => {
        balance.should.bignumber.equal(nonZeroAmount1.sub(transferredAmount));
      });
    });
  });

});

contract('Initializable', () => {
  describe('Initializable', () => {
    beforeEach(async () => {
      this.initializable = await InitializableTester.new();
    });

    it('should start uninitialized', async () => {
      await this.initializable.initialized().should.eventually.equal(false);
    });

    it('should be initialized after calling endInitialize', async () => {
      await this.initializable.try_end_initialize();
      await this.initializable.initialized().should.eventually.equal(true);
    });

    it('should not allow endInitialization to be called twice', async () => {
      await this.initializable.try_end_initialize();
      await this.initializable.try_end_initialize().should.be.rejectedWith(EVMThrow);
    });
  });
});
