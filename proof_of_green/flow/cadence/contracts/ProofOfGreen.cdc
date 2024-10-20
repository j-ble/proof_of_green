import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

pub contract ProofOfGreen {
    pub resource NFT {
        pub let id: UInt64
        
        init(id: UInt64) {
            self.id = id
        }
    }

    pub fun createNFT(id: UInt64): @NFT {
        return <-create NFT(id: id)
    }

    pub fun makePayment(amount: UFix64, recipient: Address) {
        let paymentVault <- FlowToken.withdraw(amount: amount)
        let receiverRef = getAccount(recipient)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference")

        receiverRef.deposit(from: <-paymentVault)
    }
}
