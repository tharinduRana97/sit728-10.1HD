App = {
  loading: false,
  contracts: {},
  requestPending: false,

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  loadWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
    } else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  },

  loadAccount: async () => {
    if (App.requestPending) return;
    App.requestPending = true;

    try {
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length === 0) {
        const requestedAccounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        App.account = requestedAccounts[0];
      } else {
        App.account = accounts[0];
      }

      console.log("Using this account:", App.account);
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      App.requestPending = false;
    }
  },

  loadContract: async () => {
    const foodSupplyChain = await $.getJSON("FoodSupplyChain.json");
    App.contracts.FoodSupplyChain = TruffleContract(foodSupplyChain);
    App.contracts.FoodSupplyChain.setProvider(App.web3Provider);
    App.foodSupplyChain = await App.contracts.FoodSupplyChain.deployed();

    const productBatchToken = await $.getJSON("ProductBatchToken.json");
    App.contracts.ProductBatchToken = TruffleContract(productBatchToken);
    App.contracts.ProductBatchToken.setProvider(App.web3Provider);
    App.productBatchToken = await App.contracts.ProductBatchToken.deployed();
  },

  render: async () => {
    if (App.loading) return;
    App.setLoading(true);
    $("#account").html(App.account);
    await App.renderProducts();
    await App.renderInventory();
    await App.renderCustomerSales();
    App.setLoading(false);
  },
  authenticateAdmin: async (adminAddress, password) => {
    try {
      const isAdmin = await App.foodSupplyChain.authenticateAdmin(
        adminAddress,
        password
      );
      return isAdmin;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  },

  registerAdmin: async (adminAddress, password) => {
    try {
      // Register the admin on the blockchain 
      await App.foodSupplyChain.registerAdmin(adminAddress, password, {
        from: App.account,
        gas: 500000,
      });
      console.log("Admin registered successfully!");
    } catch (error) {
      console.error("Error registering admin:", error);
      throw error;
    }
  },
  renderProducts: async () => {
    const productCount = (
      await App.foodSupplyChain.productCount({ from: App.account })
    ).toNumber();
    const $productTemplate = $(".productTemplate");

    for (var i = 0; i < productCount; i++) {
      const product = await App.foodSupplyChain.products(i);
      const productId = product[0].toNumber();
      const productName = product[1];
      const productStatus = product[3]; 

      const $newProductTemplate = $productTemplate.clone();
      $newProductTemplate
        .find(".avatar-initial")
        .text(productName.charAt(0).toUpperCase())
        .css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

      $newProductTemplate.find(".product-name").html(productName);
      $newProductTemplate.find(".product-id").html(productId);
      $newProductTemplate.find(".product-status").html(productStatus); 

      $("#productListItems").append($newProductTemplate);
      $newProductTemplate.show();
    }
  },
  renderInventory: async () => {
    // Fetch the total number of products in the FoodSupplyChain contract
    const productCount = await App.foodSupplyChain.productCount({
      from: App.account,
    });

    const $inventoryTemplate = $(".inventoryTemplate");

    for (let i = 0; i < productCount; i++) {
      // Fetch product details from the FoodSupplyChain contract
      const product = await App.foodSupplyChain.products(i);
      const productId = product[0].toNumber();
      const productName = product[1];

      // Fetch the batch quantity from the ProductBatchToken contract
      const quantity = await App.productBatchToken.balanceOf(
        App.account,
        productId
      );

      // Fetch batch details from the ProductBatchToken contract
      const [batchName, batchDate] =
        await App.productBatchToken.getBatchDetails(productId, App.account);

      // Clone the template and populate it with data
      const $newInventoryTemplate = $inventoryTemplate.clone();

      // Set the avatar initial
      $newInventoryTemplate
        .find(".avatar-initial")
        .text(productName.charAt(0).toUpperCase())
        .css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

      // Populate the product name, quantity, batch name, and batch date
      $newInventoryTemplate.find(".product-name").html(productName);
      $newInventoryTemplate
        .find(".inventory-quantity")
        .html(quantity.toNumber());
      $newInventoryTemplate
        .find(".batch-name")
        .html(`Batch Name: ${batchName}`);
      $newInventoryTemplate
        .find(".batch-date")
        .html(`Batch Date: ${new Date(batchDate * 1000).toLocaleDateString()}`);

      // Append the populated template to the inventory list
      $("#inventoryListItems").append($newInventoryTemplate);
      $newInventoryTemplate.show();
    }
  },

  renderCustomerSales: async () => {
    // Fetch the total number of customers
    const customerCount = (
      await App.foodSupplyChain.customerCount({ from: App.account })
    ).toNumber();
    const $customerTemplate = $(".customerTemplate");
    const $productTemplate = $(".custproductTemplate");

    for (let i = 0; i < customerCount; i++) {
      // Fetch customer details using the getCustomer function
      const customer = await App.foodSupplyChain.getParticipant(i, {
        from: App.account,
      });
      const customerAddress = customer[0];
      const customerName = customer[1];
      const role = customer[2];

      // Clone the customer template
      const $newCustomerTemplate = $customerTemplate.clone();
      $newCustomerTemplate
        .find(".customer-name")
        .html(customerName + " - " + role);
      $newCustomerTemplate.find(".customer-address").html(customerAddress);
      $newCustomerTemplate
        .find(".avatar-initial")
        .text(customerName.charAt(0).toUpperCase())
        .css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

      // Fetch product token IDs directly from ProductBatchToken contract
      const productIds = await App.productBatchToken.getTokensByOwner(
        customerAddress,
        {
          from: App.account,
        }
      );

      for (let j = 0; j < productIds.length; j++) {
        const productId = productIds[j].toNumber();

        // Fetch batch details using the getBatchDetails function
        const [batchName, batchDate, status, totalAmount, ownedQuantity] =
          await App.productBatchToken.getBatchDetails(
            productId,
            customerAddress,
            {
              from: App.account,
            }
          );

        // Check if the batch has a quantity and is related to this customer
        if (ownedQuantity.toNumber() > 0) {
          // Clone the product template
          const $newProductTemplate = $productTemplate.clone();
          $newProductTemplate
            .find(".avatar-initial-prod")
            .text(batchName.charAt(0).toUpperCase())
            .css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            });
          $newProductTemplate.find(".product-name").html(batchName);
          $newProductTemplate.find(".product-id").html(productId);
          $newProductTemplate
            .find(".transferred-quantity")
            .html(ownedQuantity.toNumber());

          const $statusSelect = $("<select>")
            .addClass("status-chip-select")
            .css({
              width: "auto",
              borderRadius: "25px",
              fontSize: "0.8em",
              fontWeight: "bold",
              color: "#ffffff",
              backgroundColor: App.getStatusColor(status),
              border: "none",
              cursor: "pointer",
              textAlign: "center",
              appearance: "none",
              zIndex: 1,
            });

          // List of available statuses
          const statusOptions = [
            "Produced",
            "Transit",
            "Delivered",
            "Returned",
          ];
          statusOptions.forEach((statusOption) => {
            const $option = $("<option>")
              .attr("value", statusOption)
              .text(statusOption);

            if (statusOption === status) {
              $option.attr("selected", "selected"); // Set the default selected option
            }

            $statusSelect.append($option);
          });

          // Attach the status select element to the template
          $newProductTemplate
            .find(".inventory-status-container")
            .append($statusSelect);

          // Handle status change event
          $statusSelect.on("change", async function () {
            const newStatus = $(this).val(); // Get the selected value
            try {
              await App.productBatchToken.updateBatchStatus(
                productId,
                newStatus,
                {
                  from: App.account,
                  gas: 500000, // Increase the gas limit if needed
                }
              );
              if (newStatus == "Returned") {
                const isApproved = await App.productBatchToken.isApprovedForAll(
                  "0x250d98bf0a717aaa5bf83b9e0391ccacf4998cf7",
                  App.account
                );

                // If not approved, set approval
                if (!isApproved) {
                  await App.productBatchToken.setApprovalForAll(
                    "0x07521c0724ed89ab82ea422d6ae5cf42c969a7eb",
                    true,
                    {
                      from: "0x250d98bf0a717aaa5bf83b9e0391ccacf4998cf7",
                      gas: 500000, // Adjust gas limit if needed
                    }
                  );
                  M.toast({
                    html: "Approval set successfully!",
                    classes: "rounded",
                  });
                }
                await App.productBatchToken.returnItems(productId, {
                  from: App.account,
                  gas: 500000, 
                });
              }
              $(this).css("background-color", App.getStatusColor(newStatus));
              M.toast({
                html: "Status updated successfully!",
                classes: "rounded",
              });
              if (newStatus == "Returned") {
                window.location.reload();
              }
            } catch (error) {
              console.error("Error updating status:", error);
              M.toast({
                html: `Error: ${error.message}`,
                classes: "rounded",
              });
            }
          });

          // Append the product template to the customer's product list
          $newCustomerTemplate.find(".productList").append($newProductTemplate);
          $newProductTemplate.show();
        }
      }

      // Append the populated customer template to the customer list if they have sales
      if ($newCustomerTemplate.find(".productList").children().length > 0) {
        $("#customerListItems").append($newCustomerTemplate);
        $newCustomerTemplate.show();
      }
    }

    // Toggle the visibility of the product list when the customerTemplate is clicked,
    // but ignore clicks originating from interactive child elements
    $(document).on("click", ".customerTemplate", function (event) {
      const clickedElement = $(event.target);
      if (
        !clickedElement.closest(".inventory-status-select").length && 
        !clickedElement.closest(".update-status-btn").length && 
        !clickedElement.closest(".productList").length 
      ) {
        $(this).find(".productList").slideToggle();
      }
    });

    // Prevent propagation for interactive elements to avoid triggering the collapse
    $(document).on(
      "click",
      ".inventory-status-select, .update-status-btn",
      function (event) {
        event.stopPropagation(); // Prevent event propagation to parent elements
      }
    );
  },

  getStatusColor: (status) => {
    switch (status) {
      case "Produced":
        return "#4caf50"; // Green for produced
      case "Supplier Returned":
        return "#f44336"; // Red for supplier returned
      case "Processed":
        return "#ff9800"; // Orange for processed
      case "Transit":
        return "#03a9f4"; // Light blue for transit
      case "Delivered":
        return "#8bc34a"; // Light green for delivered
      case "Returned":
        return "#795548"; // Brown for returned
      default:
        return "#2196f3"; // Default blue color for unknown statuses
    }
  },
  updateInventoryStatus: async (productId, customerAddress, newStatus) => {
    try {
      await App.foodSupplyChain.updateInventoryStatus(productId, newStatus, {
        from: App.account,
        gas: 500000,
      });
      console.log(
        `Status for product ID ${productId} of customer ${customerAddress} updated to ${newStatus}`
      );
    } catch (error) {
      console.error("Error updating inventory status:", error);
    }
  },

  createProduct: async () => {
    event.preventDefault();
    App.setLoading(true);
    const productId = parseInt($("#productId").val());
    const productName = $("#newProduct").val();
    try {
      await App.foodSupplyChain.createProduct(productId, productName, {
        from: App.account,
        gas: 500000,
      });
      M.toast({ html: "Product created successfully!", classes: "rounded" });
      window.location.reload();
    } catch (error) {
      console.error("Error creating product:", error);
      M.toast({ html: `Error: ${error.message}`, classes: "rounded" });
    } finally {
      App.setLoading(false);
    }
  },

  registerParticipant: async () => {
    event.preventDefault();
    App.setLoading(true);
    const name = document.getElementById("participantName").value;
    const role = document.getElementById("role").value;
    const address = document.getElementById("participantAddress").value;

    try {
      const result = await App.foodSupplyChain.registerParticipant(
        name,
        role,
        address,
        {
          from: App.account,
          gas: 500000,
        }
      );
      M.toast({
        html: "Participant saved successfully!",
        classes: "rounded",
      });
      window.location.reload();
      console.log("Participant registered:", result);
    } catch (error) {
      console.error("Error registering participant:", error);
    }
  },

  addToInventory: async () => {
    event.preventDefault();
    App.setLoading(true);
    const productId = $("#productIdInv").val();
    const quantity = $("#quantity").val();
    const status = $("#inventoryStatus").val(); 
    await App.foodSupplyChain.addToInventory(productId, quantity, status, {
      from: App.account,
      gas: 500000,
    });
    M.toast({ html: "Inventory updated successfully!", classes: "rounded" });
    window.location.reload();
  },

  transferInventory: async () => {
    event.preventDefault();
    App.setLoading(true);
    const productId = $("#transferProductId").val();
    const quantity = $("#transferQuantity").val();
    const toAddress = $("#toAddress").val();
    const foodSupplyChainAddress = App.foodSupplyChain.address;
    const isApproved = await App.productBatchToken.isApprovedForAll(
      App.account,
      foodSupplyChainAddress
    );

    // If not approved, set approval
    if (!isApproved) {
      await App.productBatchToken.setApprovalForAll(
        foodSupplyChainAddress,
        true,
        {
          from: App.account,
          gas: 500000, 
        }
      );
      M.toast({ html: "Approval set successfully!", classes: "rounded" });
    }
    await App.foodSupplyChain.transferInventory(
      productId,
      quantity,
      toAddress,
      { from: App.account, gas: 500000 }
    );
    M.toast({
      html: "Inventory transferred successfully!",
      classes: "rounded",
    });
    window.location.reload();
  },

  updateProductStatus: async () => {
    event.preventDefault();
    App.setLoading(true);
    const productId = $("#statusProductId").val();
    const status = $("#status").val();
    await App.foodSupplyChain.updateInventoryStatus(productId, status, {
      from: App.account,
      gas: 500000,
    });
    M.toast({
      html: "Inventory status updated successfully!",
      classes: "rounded",
    });
    window.location.reload();
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll("select");
  M.FormSelect.init(elems);
});

// Flatpickr for the deadline input
flatpickr("#deadline", {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  minDate: "today",
});

// Function to handle expand/collapse of cards
$(document).ready(function () {
  $(".card-header").click(function () {
    const $content = $(this).next(".card-content");
    const $arrow = $(this).find(".expand-arrow");

    // Toggle visibility of the content with a sliding effect and handle the arrow rotation in the callback
    $content.slideToggle(300, function () {
      // Check if content is visible after the slide animation completes
      if ($content.is(":visible")) {
        // Content is visible, set arrow to point upwards
        $arrow.css("transform", "translateY(-50%) rotate(-90deg)");
      } else {
        // Content is hidden, set arrow to point downwards
        $arrow.css("transform", "translateY(-50%) rotate(90deg)");
      }
    });
  });
});

$(() => {
  $(window).load(() => {
    App.load();
  });
});
