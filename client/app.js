import { ethers } from "./ethers-5.2.esm.min.js";
import { contractAddress, abi } from "./constants.js";

const fund_btn = document.getElementById("fund_btn");
const connect_btn = document.getElementById("connect_btn");
const balance_btn = document.getElementById("balanceButton");
const withdraw_btn = document.getElementById("withdrawButton");

console.log("starting with frontend ");

const connect = async () => {
	if (typeof window.ethereum !== "undefined") {
		await window.ethereum.request({ method: "eth_requestAccounts" });
		console.log("connected");
		connect_btn.innerText = "Connected";
		console.log(ethers);
	} else {
		connect_btn.innerText = "Please install metamask";
	}
};
connect_btn.onclick = connect;

// // fund function
const fund = async () => {
	let ethAmount = document.getElementById("ethAmount").value;
	console.log(`Funding with ${ethAmount}`);
	if (typeof window.ethereum !== "undefined") {
		// access the provider, signer,CA and abi to connect to the blockchain
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		// console.log(signer);
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const transactionResponse = await contract.fund({
				value: ethers.utils.parseEther(ethAmount),
			});
			// listen for the transaction to be mined
			await listenForTransactionMine(transactionResponse, provider);
			console.log("Done !");
		} catch (error) {
			console.log(error);
		}
	} else {
		console.log("Please install metamask ");
	}
};
fund_btn.onclick = fund;

// to check balance
const getBalance = async () => {
	if (typeof window.ethereum != "undefined") {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const balance = await provider.getBalance(contractAddress);
		document.getElementById("balance").innerHTML =
			ethers.utils.formatEther(balance);
		console.log(ethers.utils.formatEther(balance));
	}
};
balance_btn.onclick = getBalance;

const listenForTransactionMine = (transactionResponse, provider) => {
	console.log(`Mining at ${transactionResponse.hash}...`);
	// listen for the transaction to finish
	return new Promise((resolve, reject) => {
		provider.once(transactionResponse.hash, (transactionReceipt) => {
			console.log(
				`Completed with ${transactionReceipt.confirmations} confirmations`
			);
			resolve();
		});
	});
};

// // withdraw function
const withdraw = async () => {
	if (typeof window.ethereum != "undefined") {
		console.log("Withdrawing...");
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = await provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);

		try {
			const transactionResponse = await contract.withdraw();
			await listenForTransactionMine(transactionResponse, provider);
		} catch (error) {
			console.log(error);
		}
	}
};
withdraw_btn.onclick = withdraw;
