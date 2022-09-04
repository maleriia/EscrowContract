const { expect } = require("chai");
describe("Escrow", function () {
  let escrow;
  let erc20;

  let account1;
  let account2;
  const amount = ethers.utils.parseUnits("20.0");
  before(async function () {
    /**
     * Deploy ERC20 token
     * */
    const ERC20Contract = await ethers.getContractFactory("MockDaiToken");
    erc20 = await ERC20Contract.deploy();
    await erc20.deployed();
    /**
     * Get test accounts
     * */
    const accounts = await hre.ethers.getSigners();
    deployer = accounts[0];
    account1 = accounts[1];
    account2 = accounts[2];
    /**
     * Transfer some ERC20s to account1
     * */
    const transferTx = await erc20.transfer(
      account1.address,
      "80000000000000000000"
    );
    await transferTx.wait();
    /**
     * Deploy Escrow Contract
     *
     * - Add ERC20 address to the constructor
     * - Add escrow admin wallet address to the constructor
     * */
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(erc20.address);
    await escrow.deployed();
    /**
     * Seed ERC20 allowance
     * */
    const erc20WithSigner = erc20.connect(account1);
    const approveTx = await erc20WithSigner.approve(
      escrow.address,
      "90000000000000000000"
    );
    await approveTx.wait();
  });
  describe("DepositEscrow", function () {
    it("Change Balance", async function () {
      const contractWithSigner = escrow.connect(account1);
      const trxHash = await escrow.getHash(amount);
      const depositEscrowTx = await contractWithSigner.depositEscrow(
        trxHash,
        amount
      );
      await depositEscrowTx.wait();
      expect((await erc20.balanceOf(account1.address)).toString()).to.equal(
        "60000000000000000000"
      );
      res = await erc20.balanceOf(escrow.address);
      console.log(res);

      expect((await erc20.balanceOf(escrow.address)).toString()).to.equal(
        "20000000000000000000"
      );
    });

    it("Transaction hash cannot be empty!", async function () {
      const contractWithSigner = escrow.connect(account2);
      let err = "";
      try {
        await contractWithSigner.depositEscrow(
          ethers.constants.HashZero,
          amount
        );
      } catch (e) {
        err = e.message;
      }
      expect(err).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Transaction hash cannot be empty!'"
      );
    });

    it("Escrow amount cannot be equal to 0.", async function () {
      const contractWithSigner = escrow.connect(account2);
      const trxHash = await escrow.getHash(amount);
      let err = "";
      try {
        await contractWithSigner.depositEscrow(
          trxHash,
          ethers.utils.parseUnits("0")
        );
      } catch (e) {
        err = e.message;
      }
      expect(err).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Escrow amount cannot be equal to 0.'"
      );
    });

    it("ERC20: insufficient allowance", async function () {
      const contractWithSigner = escrow.connect(account2);
      const trxHash = await escrow.getHash(amount);
      let err = "";
      try {
        await contractWithSigner.depositEscrow(trxHash, amount);
      } catch (e) {
        err = e.message;
      }
      expect(err).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'ERC20: insufficient allowance'"
      );
    });
  });

  describe("WithdrawalEscrow", function () {
    it("Change balance", async function () {
      const contractWithSigner = escrow.connect(account1);
      const trxHash = await escrow.getHash(amount);
      const submitEscrowTx = await contractWithSigner.depositEscrow(
        trxHash,
        amount
      );
      await submitEscrowTx.wait();
      expect((await erc20.balanceOf(account1.address)).toString()).to.equal(
        "40000000000000000000"
      );
      const withdrawalEscrowTx = await contractWithSigner.withdrawalEscrow(
        trxHash
      );
      await withdrawalEscrowTx.wait();
      expect((await erc20.balanceOf(account1.address)).toString()).to.equal(
        "60000000000000000000"
      );
    });

    it("Escrow with transaction hash doesn't exist.", async function () {
      const contractWithSigner = escrow.connect(account1);
      const trxHash = await escrow.getHash(ethers.utils.parseUnits("1.0"));
      let err = "";
      try {
        await contractWithSigner.withdrawalEscrow(trxHash);
      } catch (e) {
        err = e.message;
      }
      expect(err).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Escrow with transaction hash doesn't exist.'"
      );
    });
  });
  describe("User gets tokens", function () {
    it("User can't get tokens from same address 1+ time", async function () {
      const contractWithSigner = erc20.connect(account1);
      receipt1 = await contractWithSigner.getTokens();
      expect((await erc20.balanceOf(account1.address)).toString()).to.equal(
        "70000000000000000000"
      );
      await expect(contractWithSigner.getTokens()).to.be.revertedWith(
        "U have already received your allowed tokens"
      );
    });
  });
});
