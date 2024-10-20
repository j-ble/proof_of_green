import * as fcl from "@onflow/fcl";

// Function to mint a Proof of Green NFT
export const mintProofOfGreenNFT = async (id) => {
    // Initiate a Flow blockchain transaction
    const transactionId = await fcl.mutate({
        // Cadence script to create and store the NFT
        cadence: `
            import ProofOfGreen from 0xPROOFOFGREEN_ADDRESS

            transaction(id: UInt64) {
                prepare(signer: AuthAccount) {
                    let nft <- ProofOfGreen.createNFT(id: id)
                    // Add logic to store the NFT in the user's account
                }
            }
        `,
        // Arguments for the transaction
        args: (arg, t) => [arg(id, t.UInt64)],
        // Transaction configuration
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 999
    });

    // Wait for the transaction to be sealed (confirmed) on the blockchain
    return fcl.tx(transactionId).onceSealed();
};

// Function to make a payment using the Proof of Green contract
export const makePayment = async (amount, recipientAddress) => {
    // Initiate a Flow blockchain transaction
    const transactionId = await fcl.mutate({
        // Cadence script to execute the payment
        cadence: `
            import ProofOfGreen from 0xPROOFOFGREEN_ADDRESS

            transaction(amount: UFix64, recipient: Address) {
                prepare(signer: AuthAccount) {
                    ProofOfGreen.makePayment(amount: amount, recipient: recipient)
                }
            }
        `,
        // Arguments for the transaction
        args: (arg, t) => [
            arg(amount, t.UFix64),
            arg(recipientAddress, t.Address)
        ],
        // Transaction configuration
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 999
    });

    // Wait for the transaction to be sealed (confirmed) on the blockchain
    return fcl.tx(transactionId).onceSealed();
};
