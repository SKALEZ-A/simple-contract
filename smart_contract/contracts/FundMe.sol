// SPDX-License-Identifier: MIT
// Using ChainLink VFR
// Floating point math in solidity
pragma solidity 0.8.7;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
	address private immutable i_owner;

	using PriceConverter for uint256;

	uint256 public constant MINIMUM_USD = (50 * 10) ^ 18;

	// to keep track of the people that sent mkney to the contract
	address[] public funders;
	mapping(address => uint256) private s_addressToAmountFunded;

	AggregatorV3Interface private s_priceFeed;

	constructor(address priceFeedAddress) {
		i_owner = msg.sender;
		s_priceFeed = AggregatorV3Interface(priceFeedAddress);
	}

	modifier onlyOwner() {
		// require(i_owner == msg.sender, "Sender is not owner");
		if (msg.sender != i_owner) {
			revert NotOwner();
		} // another way to reduce gas.
		_;
	}

	// function to allow anyone send ether to the contract without calling the fund function
	receive() external payable {
		fund();
	}

	fallback() external payable {
		fund();
	}

	function fund() public payable {
		// require(msg.value.getConversionRate(priceFeed) >= MINIMUM_USD, "Didnt send enough ether");
		funders.push(msg.sender);
		s_addressToAmountFunded[msg.sender] += msg.value;
	}

	function getBalance() public view returns (uint) {
		return address(this).balance;
	}

	function withdraw() public onlyOwner {
		// looping through all addresses
		for (uint funderIndex = 0; funderIndex < funders.length; funderIndex++) {
			address funder = funders[funderIndex];
			s_addressToAmountFunded[funder] = 0;
		}

		// resetting the array
		funders = new address[](0);

		// withdrawing the funds
		// payable(msg.sender).transfer(address(this).balance);     // transfer

		// //send
		// bool sendSuccess = payable(msg.sender).send(address(this).balance);    // send
		// require(sendSuccess, "Send failed");

		//call
		(bool callSuccess, ) = payable(msg.sender).call{
			value: address(this).balance
		}("");
		require(callSuccess, "Call failed");
	}

	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getAddressToAmountFunded(
		address fundingAddress
	) public view returns (uint256) {
		return s_addressToAmountFunded[fundingAddress];
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
		return s_priceFeed;
	}
}
