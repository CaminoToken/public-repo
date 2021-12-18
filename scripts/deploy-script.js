// This script can be used to deploy the script using Hardhat
// Alternatively, Remix can be used to do the same.
// Remix will also trigger Metamask upon deploying, which will show the fees required.

const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("CaminoToken");
  const token = await Token.deploy("Camino", "CAMI", 18, 50);

  await token.deployed();

  console.log("Token deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
