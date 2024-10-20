import * as fcl from "@onflow/fcl";

export const mintProofOfGreenNFT = async (id) => {
    const transactionId = await fcl.mutate({
        cadence: `
            import ProofOfGreen from 0xPROOFOFGREEN_ADDRESS

            transaction(id: UInt64) {
                prepare(signer: AuthAccount) {
                    let nft <- ProofOfGreen.createNFT(id: id)
                    // Add logic to store the NFT in the user's account
                }
            }
        `,
        args: (arg, t) => [arg(id, t.UInt64)],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 999
    });

    return fcl.tx(transactionId).onceSealed();
};

export const makePayment = async (amount, recipientAddress) => {
    const transactionId = await fcl.mutate({
        cadence: `
            import ProofOfGreen from 0xPROOFOFGREEN_ADDRESS

            transaction(amount: UFix64, recipient: Address) {
                prepare(signer: AuthAccount) {
                    ProofOfGreen.makePayment(amount: amount, recipient: recipient)
                }
            }
        `,
        args: (arg, t) => [
            arg(amount, t.UFix64),
            arg(recipientAddress, t.Address)
        ],
        payer: fcl.authz,
        proposer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 999
    });

    return fcl.tx(transactionId).onceSealed();
};
