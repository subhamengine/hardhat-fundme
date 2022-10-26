const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { getNameOfDeclaration } = require("typescript")
const { assert, expect } = require("chai")



describe("FundMe", async function () {
    let FundMe
    let deployer
    let MockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function () {
        //deploy our fundme contract
        //using Hardhat-deploy
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all") //allow to run entire deploy folder withn multiple tags
        FundMe = await ethers.getContract("FundMe", deployer)
        MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })
    describe("constructor", async function () {
        it("sets the aggregator addresses  correctly", async function () {
            const response = await FundMe.getPriceFeed();
            assert.equal(response, MockV3Aggregator.address)
        })
    })

    describe("fund", function () {
        // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
        // could also do assert.fail
        it("Fails if you don't send enough ETH", async () => {
            await expect(FundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("Updates the amount funded data structure", async () => {
            await FundMe.fund({ value: sendValue })
            const response = await FundMe.getAddressToAmountFunded(
                deployer
            )
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async () => {
            await FundMe.fund({ value: sendValue })
            const response = await FundMe.getFunder(0)
            assert.equal(response, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await FundMe.fund({ value: sendValue })
        })


        it("withdraw Eth from a single founder", async function () {
            //Arrange
            const startingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
            const startingDeployerBalance = await FundMe.provider.getBalance(deployer)
            //act
            const transactionResponse = await FundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
            const endingDeployerBalance = await FundMe.provider.getBalance(deployer)
            //assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance), endingDeployerBalance.add(gasCost).toString())
        })
        it("allows us to withdraw with multiple funders", async function () {

            //Arrange Section
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await FundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
            const startingDeployerBalance = await FundMe.provider.getBalance(deployer)


            //ACT

            const transactionResponse = await FundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            //Assert
            const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
            const endingDeployerBalance = await FundMe.provider.getBalance(deployer)
            //assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance), endingDeployerBalance.add(gasCost).toString())



            //make sure that the funders array is reset properly

            await expect(FundMe.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(await FundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }
        })

        it("Only Allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1];
            const attackerConnectedContract = await FundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(FundMe, "FundMe__NotOwner")
        })



        it("cheaper withdraw testing", async function () {

            //Arrange Section
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await FundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
            const startingDeployerBalance = await FundMe.provider.getBalance(deployer)


            //ACT

            const transactionResponse = await FundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            //Assert
            const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
            const endingDeployerBalance = await FundMe.provider.getBalance(deployer)
            //assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance), endingDeployerBalance.add(gasCost).toString())



            //make sure that the funders array is reset properly

            await expect(FundMe.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(await FundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }
        })
    })

})