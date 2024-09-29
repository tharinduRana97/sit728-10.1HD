const Web3 = require("web3");

// Use HTTP provider for Ganache (replace with WebSocket if needed)
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

// Replace with your actual transaction hash
const txHash =
  "0x2d4a407f4e6d0953af11d6f9fcfad535b5a9660e37cb5a04de0180ed8f4fc887";

// Function to get the transaction receipt
async function getTransactionReceipt(txHash) {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txHash);

    if (receipt) {
      console.log("Transaction Receipt:", receipt);
    } else {
      console.log("Transaction receipt not found.");
    }
  } catch (error) {
    console.error("Error fetching transaction receipt:", error);
  }
}

// Function to get the transaction signature (r, s, v)
async function getTransactionSignature(txHash) {
  try {
    const tx = await web3.eth.getTransaction(txHash);

    if (tx) {
      console.log("Transaction Details:", tx);

      // Signature components
      const r = tx.r;
      const s = tx.s;
      const v = tx.v;
      const rawTransaction = tx;

      console.log("Signature components");
      console.log("r:", rawTransaction);
      console.log("r:", r);
      console.log("s:", s);
      console.log("v:", v);
    } else {
      console.log("Transaction not found.");
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
  }
}

// Call both functions
getTransactionReceipt(txHash);
getTransactionSignature(txHash);

// Function to get the transaction signature (r, s, v)
async function getTransactionSignature(txHash) {
  try {
    const tx = await web3.eth.getTransaction(txHash);

    if (tx) {
      console.log("Transaction Details:", tx);

      // Signature components
      const r = tx.r;
      const s = tx.s;
      const v = tx.v;

      console.log("Signature components:");
      console.log("r:", r);
      console.log("s:", s);
      console.log("v:", v);
    } else {
      console.log("Transaction not found.");
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
  }
}

// Call both functions
getTransactionReceipt(txHash);
getTransactionSignature(txHash);
