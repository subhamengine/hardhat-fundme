const { getNamedAccounts, ethers } = require("hardhat")


async function main() {
    const { deployer } = await getNamedAccounts()
    const FundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding ..")
    const transactionResponse = await FundMe.withdraw()
    await transactionResponse.wait(1);
    console.log("Got it back!")
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error)
    process.exit(1)
})