// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    struct ProductDetails {
        string name;
        uint256 creationDate;
    }

    mapping(uint256 => ProductDetails) public productInfo;

    // No need to pass initialOwner; Ownable sets the owner to the deployer
    constructor() ERC721("ProductNFT", "PNFT") {}

    function mintProduct(address recipient, string memory productName) public returns (uint256) {
        uint256 tokenId = nextTokenId; // Capture the current tokenId
        _safeMint(recipient, tokenId);
        productInfo[tokenId] = ProductDetails(productName, block.timestamp);
        nextTokenId++; // Increment the tokenId counter
        return tokenId; // Return the minted tokenId
    }

    function getProductDetails(uint256 tokenId) public view returns (ProductDetails memory) {
        return productInfo[tokenId];
    }
}
