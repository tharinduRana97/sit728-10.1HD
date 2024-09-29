# Food Supply Chain DApp

This decentralized application (DApp) enables the transparent and secure tracking of food products throughout the supply chain using blockchain technology. It leverages Ethereum smart contracts to create and manage Non-Fungible Tokens (NFTs) and batch tokens to represent individual products and product batches. The DApp is built with Solidity for smart contract development and Web3.js for front-end interaction.



## Introduction

The Food Supply Chain DApp provides a blockchain-based solution for tracking the journey of food products from suppliers to customers. It enhances transparency, traceability, and security in the supply chain by recording each transaction and status change on the blockchain.

## Features

- **Participant Registration**: Register suppliers, retailers, and customers as participants in the supply chain.
- **Product Creation**: Create individual product tokens (ERC721) and batch tokens (ERC1155) to represent products and product batches.
- **Inventory Management**: Manage product batches, update their status, and transfer ownership between participants.
- **Product Tracking**: Track the status of each product and batch, including production, transit, and delivery.
- **Secure Access**: Utilize role-based access control and secure authentication for administrative tasks.

## Technologies Used

- **Blockchain Platform**: Ethereum
- **Smart Contracts**: Solidity
- **Front-end**: HTML, CSS, JavaScript, Web3.js
- **Framework**: Truffle
- **Wallet**: MetaMask
- **Testing**: Ganache (Local Ethereum Network)

## Smart Contracts

The project includes three primary smart contracts:

1. **FoodSupplyChain.sol**: Manages participants, product creation, inventory updates, and ownership transfers.
2. **ProductNFT.sol**: Implements ERC721 tokens to represent individual food products.
3. **ProductBatchToken.sol**: Implements ERC1155 tokens to represent batches of products with various statuses.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tharinduDeakin/sit728-10.1HD.git
   cd sit728-10.1HD
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Ganache**:
   Launch a local Ethereum blockchain using Ganache.

4. **Deploy Contracts**:
   ```bash
   truffle migrate 
   ```

5. **Run the DApp**:
   ```bash
   npm run dev
   ```

6. **Connect MetaMask**:
   Connect MetaMask to your local blockchain network.

## Usage

1. **Load the DApp**:
   Open `http://localhost:3000` in your browser.
   
2. **Connect Wallet**:
   Use MetaMask to connect your Ethereum wallet.

3. **Register Participants**:
   Register suppliers, retailers, and customers using the admin panel.

4. **Create and Transfer Products**:
   Create product batches and transfer them through the supply chain, updating their status as they move from supplier to retailer to customer.

5. **Track Products**:
   Use the UI to track the status and ownership of individual products and batches.

## Front-end Implementation

The front-end interacts with the blockchain using Web3.js. It initializes the Web3 provider with MetaMask, loads the user's Ethereum account, and communicates with the deployed smart contracts. A snippet to set up the provider:

```javascript
if (typeof web3 !== "undefined") {
  web3 = new Web3(web3.currentProvider);
} else {
  console.log("Please install MetaMask!");
}
```


## License

This project is licensed under the MIT License.

---
