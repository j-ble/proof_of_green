import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

// ProofOfGreen contract for managing NFTs and payments
pub contract ProofOfGreen {
    // NFT resource representing a Proof of Green token
    pub resource NFT {
        pub let id: UInt64
        
        init(id: UInt64) {
            self.id = id
        }
    }

    // Function to create a new NFT
    pub fun createNFT(id: UInt64): @NFT {
        return <-create NFT(id: id)
    }

    // Function to make a payment using Flow tokens
    pub fun makePayment(amount: UFix64, recipient: Address) {
        // Withdraw the specified amount from the payer's account
        let paymentVault <- FlowToken.withdraw(amount: amount)
        
        // Get a reference to the recipient's Flow token receiver
        let receiverRef = getAccount(recipient)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference")

        // Deposit the payment to the recipient's account
        receiverRef.deposit(from: <-paymentVault)
    }
}
