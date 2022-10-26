const { getNamedAccounts, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")


developmentChains.includes(network.name)
    ?
    describe.skip
    :
    describe("FundMe", async function () {
        let FundMe
        let deployer
        const sendValue = ethers.utils.parseEther("1");
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            FundMe = await ethers.getContract("FundMe", deployer)

        })
        it("allows people to fund and withdraw", async function () {
            await FundMe.fund({ value: sendValue })
            await FundMe.withdraw();
            const endingBalance = await FundMe.provider.getBalance(FundMe.address)
            assert.equal(endingBalance.toSring(), "0")
        })
    })