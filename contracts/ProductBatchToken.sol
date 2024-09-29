// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductBatchToken is ERC1155, Ownable {
    uint256 public constant PRODUCT_TYPE = 1;

    struct BatchDetails {
        string batchName;
        uint256 batchDate;
        string status; // Status of the batch (e.g., Produced, In Transit, Delivered)
        uint256 totalAmount; // Total quantity of items in the batch
    }

    // Mapping to store batch details for each token ID
    mapping(uint256 => BatchDetails) public batchInfo;

    // Mapping to track which token IDs are owned by which addresses
    mapping(address => uint256[]) public ownerTokens;

    // Mapping to track the previous owner of each batch ID
    mapping(uint256 => address) public previousOwner;

    // Operator address with permission to handle all tokens
    address public operator;

    // Events
    event BatchMinted(
        address recipient,
        uint256 batchId,
        uint256 amount,
        string batchName
    );
    event BatchStatusUpdated(uint256 batchId, string status);
    event BatchTransferred(
        uint256 batchId,
        address from,
        address to,
        uint256 amount
    );

    // Constructor to initialize metadata URI
    constructor() ERC1155("https://api.example.com/metadata/{id}.json") {}

    // Function to mint a new batch of products
    function mintBatch(
        address recipient,
        uint256 batchId,
        uint256 amount,
        string memory batchName,
        string memory status
    ) public {
        require(
            bytes(batchInfo[batchId].batchName).length == 0,
            "Batch ID already exists"
        ); // Ensure batch ID does not already exist

        _mint(recipient, batchId, amount, "");
        batchInfo[batchId] = BatchDetails(
            batchName,
            block.timestamp,
            status,
            amount
        );

        // Add the batchId to the recipient's list of owned tokens
        ownerTokens[recipient].push(batchId);

        emit BatchMinted(recipient, batchId, amount, batchName);
    }

    // Function to get batch details
    function getBatchDetails(
        uint256 batchId,
        address owner
    )
        public
        view
        returns (string memory, uint256, string memory, uint256, uint256)
    {
        BatchDetails memory details = batchInfo[batchId];
        uint256 ownedAmount = balanceOf(owner, batchId); // Get amount owned by the specific address
        return (
            details.batchName,
            details.batchDate,
            details.status,
            details.totalAmount,
            ownedAmount
        );
    }

    // Function to update batch status
    function updateBatchStatus(uint256 batchId, string memory status) public {
        // Check if the batch exists
        require(
            bytes(batchInfo[batchId].batchName).length != 0,
            "Batch does not exist"
        );

        // Check if msg.sender is the owner of the batch
        require(
            balanceOf(msg.sender, batchId) > 0,
            "Only the owner of the batch can update the status"
        );

        // Update the batch status
        batchInfo[batchId].status = status;

        // Emit event for status update
        emit BatchStatusUpdated(batchId, status);
    }

    // Function to update batch status
    function returnItems(uint256 batchId) public {
        // If status is "Returned", transfer the batch to the previous owner
        address prevOwner = previousOwner[batchId];
        require(prevOwner != address(0), "Previous owner not set");

        uint256 amount = balanceOf(msg.sender, batchId);
        require(amount > 0, "No batch quantity available for transfer");

        safeTransferFrom(msg.sender, prevOwner, batchId, amount, "");
        previousOwner[batchId] = msg.sender;
    }

    // Function to transfer a batch or part of a batch to another address
    function transferBatch(
        address from,
        address to,
        uint256 batchId,
        uint256 amount
    ) public {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not authorized to transfer this batch"
        );
        require(
            balanceOf(from, batchId) >= amount,
            "Insufficient batch quantity to transfer"
        );

        safeTransferFrom(from, to, batchId, amount, "");
        previousOwner[batchId] = from;
        emit BatchTransferred(batchId, from, to, amount);
    }

    // Function to get all token IDs owned by a specific address
    function getTokensByOwner(
        address owner
    ) public view returns (uint256[] memory) {
        return ownerTokens[owner];
    }

    // Function to set approval for all tokens for an operator
    function setApprovalForOperator(address _operator) external {
        require(
            _operator != address(this),
            "Cannot set approval status for self"
        );
        setApprovalForAll(_operator, true);
    }

    // Override safeTransferFrom to handle transfer of inventory status and details if needed
    function safeTransferFrom(
        address from,
        address to,
        uint256 batchId,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        super.safeTransferFrom(from, to, batchId, amount, data);

        // Optionally: Update batch details on transfer if needed (e.g., adjusting totalAmount)
        // Note: Do not modify totalAmount as it should represent the total minted amount
        // batchInfo[batchId].totalAmount -= amount; // Comment out or remove this line

        // Update the ownerTokens mapping for batchId transfer
        _updateOwnerTokens(from, to, batchId);
    }

    // Internal function to update the ownerTokens mapping on transfer
    function _updateOwnerTokens(
        address from,
        address to,
        uint256 batchId
    ) internal {
        // Remove the batchId from the sender's list of owned tokens only if their balance is zero
        if (balanceOf(from, batchId) == 0) {
            uint256[] storage senderTokens = ownerTokens[from];
            for (uint256 i = 0; i < senderTokens.length; i++) {
                if (senderTokens[i] == batchId) {
                    senderTokens[i] = senderTokens[senderTokens.length - 1];
                    senderTokens.pop();
                    break;
                }
            }
        }
        previousOwner[batchId] = from;

        // Add the batchId to the recipient's list of owned tokens if not already present
        uint256[] storage recipientTokens = ownerTokens[to];
        bool alreadyOwned = false;
        for (uint256 i = 0; i < recipientTokens.length; i++) {
            if (recipientTokens[i] == batchId) {
                alreadyOwned = true;
                break;
            }
        }
        if (!alreadyOwned) {
            recipientTokens.push(batchId);
        }
    }
}
