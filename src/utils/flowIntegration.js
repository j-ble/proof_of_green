import * as fcl from "@onflow/fcl";

// Configure FCL
fcl.config()
  .put("app.detail.title", "Cannabis E-commerce")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

// Correct contract addresses for Flow testnet
const FLOW_TOKEN_ADDRESS = "0x7e60df042a9c0868";  // FlowToken on Testnet
const TAKE_FLOW_ADDRESS = "0x01cf0e2f2f715450";  // Replace with your actual contract address

// Function to initialize Flow authentication
export const initializeFlow = () => {
  return fcl.authenticate();
};

// Function to check FLOW balance for a given address
export const checkFlowBalance = async (address) => {
  try {
    console.log("Checking balance for address:", address);
    const balance = await fcl.query({
      cadence: `
        import FlowToken from ${FLOW_TOKEN_ADDRESS}

        pub fun main(address: Address): UFix64 {
          let account = getAccount(address)
          
          if let vaultRef = account.getCapability(/public/flowTokenBalance)
                              .borrow<&FlowToken.Vault{FlowToken.Balance}>() {
            return vaultRef.balance
          }
          
          return 0.0
        }
      `,
      args: (arg, t) => [arg(address, t.Address)]
    });
    console.log("Balance fetched:", balance);
    return balance;
  } catch (error) {
    console.error("Error checking Flow balance:", error);
    throw new Error(`Failed to fetch FLOW balance: ${error.message}`);
  }
};

// Function to execute a FLOW payment transaction using the TakeFlow contract
export const executeFlowPayment = async (amount) => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowToken from ${FLOW_TOKEN_ADDRESS}
        import TakeFlow from ${TAKE_FLOW_ADDRESS}

        transaction(amount: UFix64) {
            prepare(signer: AuthAccount) {
                // Get the reference to the FlowToken Vault of the sender
                let vault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                    ?? panic("Could not borrow reference to the FlowToken Vault")
                
                // Get the capability to the receiver
                let receiver = TakeFlow.createReceiver()
                
                // Withdraw the specified amount of FLOW from the user's vault
                let payment <- vault.withdraw(amount: amount)
                
                // Send the FLOW to the receiver
                receiver.receiveFlow(payment: <- payment)
                
                log("Successfully sent FLOW")
            }
        }
      `,
      args: (arg, t) => [arg(amount, t.UFix64)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 500,
    });

    return await fcl.tx(transactionId).onceSealed();
  } catch (error) {
    console.error("Error executing Flow payment:", error);
    throw new Error(`Payment transaction failed: ${error.message}`);
  }
};

// Function to get the current user
export const getCurrentUser = () => {
  return fcl.currentUser().snapshot();
};

// Function to log out the current user
export const logOut = () => {
  return fcl.unauthenticate();
};