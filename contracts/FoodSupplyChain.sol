// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ProductNFT.sol"; // ERC721 Token Contract
import "./ProductBatchToken.sol"; // ERC1155 Token Contract

contract FoodSupplyChain {
    address public owner;
    mapping(address => bool) public admins;
    mapping(address => bytes32) private adminPasswords;

    // Structure to hold details of a participant
    struct Participant {
        string name;
        string role; // producer, supplier, retailer
        address participantAddress;
        uint[] productIds; // List of product IDs the participant owns
    }

    // Structure to hold details of a product
    struct Product {
        uint id;
        string name;
        address creator;
        uint tokenId; // ERC721 or ERC1155 Token ID
    }

    // Mappings to store participants and products
    mapping(address => Participant) public participants;
    mapping(uint => Product) public products;
    mapping(uint => bool) public productExists;

    // Array to store product IDs
    uint[] public productIds;

    // Array to store customer addresses
    address[] public customerAddresses;

    // Counter for products and customers
    uint public productCount = 0;
    uint public customerCount = 0;

    // External Token Contracts
    ProductNFT public productNFT; // ERC721 Token Contract
    ProductBatchToken public productBatchToken; // ERC1155 Token Contract

    constructor(address _productNFTAddress, address _productBatchTokenAddress) {
        owner = msg.sender;
        productNFT = ProductNFT(_productNFTAddress);
        productBatchToken = ProductBatchToken(_productBatchTokenAddress);
    }

    // Events for logging
    event ParticipantRegistered(
        address participantAddress,
        string name,
        string role
    );
    event ProductCreated(
        uint productId,
        string name,
        address creator,
        uint tokenId
    );
    event OwnershipTransferred(
        uint productId,
        address from,
        address to
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can execute this");
        _;
    }

    function registerAdmin(
        address _admin,
        string memory _password
    ) public onlyOwner {
        admins[_admin] = true;
        adminPasswords[_admin] = keccak256(abi.encodePacked(_password)); // Store hashed password
    }

    function authenticateAdmin(
        address _admin,
        string memory _password
    ) public view returns (bool) {
        require(admins[_admin], "Not an admin");
        return adminPasswords[_admin] == keccak256(abi.encodePacked(_password));
    }

    // Modifier to check if participant is registered
    modifier onlyRegistered() {
        require(
            bytes(participants[msg.sender].name).length > 0,
            "Participant not registered"
        );
        _;
    }

    // Register a new participant (customer)
    function registerParticipant(
        string memory _name,
        string memory _role,
        address _participantAddress
    ) public onlyAdmin {
        require(
            bytes(participants[_participantAddress].name).length == 0,
            "Participant already registered"
        );

        // Register the participant
        participants[_participantAddress].name = _name;
        participants[_participantAddress].role = _role;
        participants[_participantAddress]
            .participantAddress = _participantAddress;

        // Add participant address to customerAddresses array
        customerAddresses.push(_participantAddress);
        customerCount++; // Increment customer count

        emit ParticipantRegistered(_participantAddress, _name, _role);
    }

    // Create a new product with ERC721 or ERC1155 token
    function createProduct(uint _id, string memory _name) public onlyAdmin {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(!productExists[_id], "Product ID already exists");

        uint tokenId;

        // Mint ERC721 token    
        tokenId = productNFT.mintProduct(msg.sender, _name);

        products[_id] = Product(_id, _name, msg.sender, tokenId);
        productExists[_id] = true;
        productIds.push(_id);
        productCount++;
        emit ProductCreated(_id, _name, msg.sender, tokenId);
    }

    // Add product to participant's inventory with initial status
    function addToInventory(
        uint _productId,
        uint _quantity,
        string memory _status
    ) public onlyAdmin {
        require(productExists[_productId], "Product does not exist");

        // Mint the corresponding amount of ERC1155 tokens for the batch
        productBatchToken.mintBatch(
            msg.sender,
            products[_productId].tokenId,
            _quantity,
            products[_productId].name,
            _status
        );
    }

    // Transfer product inventory to another participant
    function transferInventory(
        uint _productId,
        uint _quantity,
        address _to
    ) public onlyAdmin {
        require(
            bytes(participants[_to].name).length > 0,
            "Recipient not registered"
        );

        // Transfer ERC1155 tokens for the batch
        productBatchToken.safeTransferFrom(
            msg.sender,
            _to,
            products[_productId].tokenId,
            _quantity,
            ""
        );

        emit OwnershipTransferred(_productId, msg.sender, _to);
    }

    // Get product details
    function getProductDetails(
        uint _productId
    ) public view returns (uint, string memory, address) {
        Product memory product = products[_productId];
        return (product.id, product.name, product.creator);
    }

    // Get all products for a participant
    function getProductsByParticipant(
        address _participant
    ) public view onlyAdmin returns (uint[] memory) {
        return participants[_participant].productIds;
    }

    // Get details of all products a participant owns
    function getParticipantProductDetails(
        address _participant
    )
        public
        view
        onlyAdmin
        returns (uint[] memory, string[] memory)
    {
        uint[] memory productId = participants[_participant].productIds;
        string[] memory names = new string[](productId.length);

        for (uint i = 0; i < productId.length; i++) {
            Product memory product = products[productId[i]];
            names[i] = product.name;
        }

        return (productId, names);
    }

    // Get customer details by index
    function getParticipant(
        uint index
    ) public view onlyAdmin returns (address, string memory, string memory) {
        require(index < customerCount, "Index out of bounds");
        address participantAddress = customerAddresses[index];
        string memory participantName = participants[participantAddress].name;
        string memory participantRole = participants[participantAddress].role;
        return (participantAddress, participantName, participantRole);
    }
}