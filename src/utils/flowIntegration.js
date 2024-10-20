import * as fcl from "@onflow/fcl";

// Configure FCL
fcl.config({
  "app.detail.title": "Cannabis E-commerce",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xFlowToken": "0x7e60df042a9c0868", // FlowToken on Testnet
  "0xTakeFlow": "0x01cf0e2f2f715450", // Replace with your actual contract address
  "0xFungibleToken": "0x9a0766d93b6608b7", // FungibleToken on Testnet
})

// Contract addresses are now accessed via fcl.config().get()

// Function to initialize Flow authentication
export const initializeFlow = () => {
  return fcl.authenticate();
};

// Function to check FLOW balance for a given address
export const checkFlowBalance = async (address) => {
  try {
    console.log("Checking balance for address:", address);
    const result = await fcl.query({
      cadence: `
       
    import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

access(all) fun main(address: Address): UFix64 {
    // Get the account's FlowToken vault capability
    let account = getAccount(address)

    let vaultRef = account.capabilities.borrow<&FlowToken.Vault>(
        /public/flowTokenBalance
    ) ?? panic("Could not borrow reference to the FlowToken vault")

    // Return the balance
    return vaultRef.balance
}


      `,
      args: (arg, t) => [arg(address, t.Address)]
    });
    console.log("Raw query result:", result);
    
    if (result === null || result === undefined) {
      console.error("Query result is null or undefined");
      return "0.00000000";
    }

    // Convert the result to a number and format it with 8 decimal places
    const balance = parseFloat(result);
    return balance.toFixed(8);
  } catch (error) {
    console.error("Error checking Flow balance:", error);
    return "0.00000000";
  }
};

// Function to execute a FLOW payment transaction using the TakeFlow contract
export const executeFlowPayment = async (amount) => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowToken from 0xFlowToken
        import TakeFlow from 0xTakeFlow

        transaction(amount: UFix64) {
            prepare(signer: AuthAccount) {
                // Get the reference to the FlowToken Vault of the sender
                let vault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                    ?? panic("Could not borrow reference to the FlowToken Vault")
                
                // Get the capability to the receiver
                let receiver = TakeFlow.createReceiver()
                
                // Withdraw the specified amount of FLOW from the user's vault
                let payment = vault.withdraw(amount: amount)
                
                // Send the FLOW to the receiver
                receiver.receiveFlow(payment: payment)
                
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
