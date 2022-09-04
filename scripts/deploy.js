const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

  const EscrowContract = await ethers.getContractFactory("Escrow");
  escrow = await EscrowContract.deploy("0xc8c31fd03cc226e5e0c38bdee09b7577ba8cb096");
  await escrow.deployed();

  console.log(`contract Escrow deployed to ${escrow.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
