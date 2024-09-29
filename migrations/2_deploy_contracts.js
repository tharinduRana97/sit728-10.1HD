// Import the contracts
const ProductNFT = artifacts.require("ProductNFT");
const ProductBatchToken = artifacts.require("ProductBatchToken");
const FoodSupplyChain = artifacts.require("FoodSupplyChain");

module.exports = async function (deployer, network, accounts) {
  // Deploy the ProductNFT contract
  await deployer.deploy(ProductNFT);
  const productNFT = await ProductNFT.deployed();

  // Deploy the ProductBatchToken contract
  await deployer.deploy(ProductBatchToken);
  const productBatchToken = await ProductBatchToken.deployed();

  // Deploy the FoodSupplyChain contract, passing in the addresses of the other two contracts
  await deployer.deploy(
    FoodSupplyChain,
    productNFT.address,
    productBatchToken.address
  );
};
