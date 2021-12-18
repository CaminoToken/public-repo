const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CaminoToken", function () {
  it("Should mint 1000000000 tokens to the deploying address", async function () {
    const accounts = (await ethers.getSigners()).map(obj => obj.address)

    const Token = await ethers.getContractFactory("CaminoToken");
    const token = await Token.deploy("Camino", "CAMI", 18, 1000000000, 50);
    await token.deployed();

    expect((await token.balanceOf(accounts[0])).toString()).to.equal("1000000000");
  });

  it("Should mint 1000000000 tokens to accounts[0] (owner)", async function () {
    const accounts = (await ethers.getSigners()).map(obj => obj.address)

    const Token = await ethers.getContractFactory("CaminoToken");
    const token = await Token.deploy("Camino", "CAMI", 18, 0, 50);
    await token.deployed();

    await token.mint(accounts[0], 1000000000);
    expect((await token.balanceOf(accounts[0])).toString()).to.equal("1000000000");
  });

  it("Should airdropMint 1000000000 tokens to accounts[1..9]", async function () {
    const accounts = (await ethers.getSigners()).map(obj => obj.address)

    const Token = await ethers.getContractFactory("CaminoToken");
    const token = await Token.deploy("Camino", "CAMI", 18, 0, 50);
    await token.deployed();

    await token.airdropMint(accounts.slice(1, 10), Array(9).fill(1000000000));

    for (let i = 1; i < 10; i++)
      expect((await token.balanceOf(accounts[i])).toString()).to.equal("1000000000");
  });

  it("Should transfer 1000000000 tokens to accounts[1] from accounts[0] with 20% burn", async function () {
    const accounts = (await ethers.getSigners()).map(obj => obj.address)

    const Token = await ethers.getContractFactory("CaminoToken");
    const token = await Token.deploy("Camino", "CAMI", 18, 0, 2000);
    await token.deployed();

    await token.mint(accounts[0], 1000000000);
    let expectedTransferredBalance = 1000000000 * (1 - 0.2)

    await token.transfer(accounts[1], 1000000000);
    expect((await token.balanceOf(accounts[1])).toString()).to.equal(expectedTransferredBalance.toString());
  });

  it("Should transfer ownership to accounts[1] and try to mint using accounts[0], causing error and then try using new owner", async function () {
    const [, newOwner] = await ethers.getSigners()
    const accounts = (await ethers.getSigners()).map(obj => obj.address)

    const Token = await ethers.getContractFactory("CaminoToken");
    const token = await Token.deploy("Camino", "CAMI", 18, 0, 2000);
    await token.deployed();
    await token.transferOwnership(accounts[1]);

    try {
      await token.mint(accounts[0], 1000000000);
    }
    catch {
      expect(await token.connect(newOwner)
        .mint(accounts[2], 1000000000))
    }
  });
});
