import * as fcl from "@onflow/fcl";

// Configure FCL
fcl.config()
  .put("app.detail.title", "Cannabis E-commerce")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

// Correct contract addresses for Flow testnet
const FUNGIBLE_TOKEN_ADDRESS = "0x9a0766d93b6608b7";  // FungibleToken on Testnet
const USDC_ADDRESS = "0xa983fecbed621163";          // Testnet USDC address

// Function to initialize Flow authentication
export const initializeFlow = () => {
  fcl.authenticate();
};

// Function to check USDC balance for a given address
export const checkFlowBalance = async (address) => {
  try {
    console.log("Checking balance for address:", address);
    const balance = await fcl.query({
      cadence: `
        import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}
        import FiatToken from ${USDC_ADDRESS}
  
        pub fun main(address: Address): UFix64 {
          let account = getAccount(address)
          
          if let vaultRef = account.getCapability(/public/USDCVault)
                              .borrow<&{FungibleToken.Balance}>() {
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
    if (error.message.includes("Could not borrow USDC Vault reference")) {
      return 0.0; // Return 0 if the account doesn't have a USDC vault
    }
    throw new Error(`Failed to fetch USDC balance: ${error.message}`);
  }
};

// Function to execute a USDC payment transaction
export const executeFlowPayment = async (amount, recipientAddress) => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}
        import FiatToken from ${USDC_ADDRESS}

        transaction(amount: UFix64, recipient: Address) {
          let senderVault: &FiatToken.Vault
          let recipientVault: &{FungibleToken.Receiver}

          prepare(signer: AuthAccount) {
            self.senderVault = signer.borrow<&FiatToken.Vault>(from: /storage/USDCVault)
              ?? panic("Could not borrow sender's USDC Vault")

            self.recipientVault = getAccount(recipient)
              .getCapability(/public/USDCVault)
              .borrow<&{FungibleToken.Receiver}>()
              ?? panic("Could not borrow recipient's USDC Vault")
          }

          execute {
            self.recipientVault.deposit(from: <-self.senderVault.withdraw(amount: amount))
          }
        }
      `,
      args: (arg, t) => [arg(amount, t.UFix64), arg(recipientAddress, t.Address)],
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