const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
	const { deployer } = await getNamedAccounts;
	const fundMe = await ethers.getContract("FundMe", deployer);
	console.log("Funding...");
	const transactionResponse = await fundMe.withdraw();
	await transactionResponse.wait(1);
	console.log("Refunded...😝");
};

main()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
