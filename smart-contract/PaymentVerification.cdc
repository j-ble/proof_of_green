access(all) contract PaymentVerification {

    // Struct to store payment details for audit purposes
    access(all) struct PaymentInfo {
        access(all) let payer: Address
        access(all) let amount: UFix64
        access(all) let productId: String
        access(all) let timestamp: UFix64
        access(all) let verified: Bool

        init(payer: Address, amount: UFix64, productId: String, timestamp: UFix64, verified: Bool) {
            self.payer = payer
            self.amount = amount
            self.productId = productId
            self.timestamp = timestamp
            self.verified = verified
        }
    }

    // Resource to store individual payment details with timestamp
    access(all) resource Payment {
        access(all) let payer: Address
        access(all) let amount: UFix64
        access(all) let productId: String
        access(all) let timestamp: UFix64
        access(all) var verified: Bool

        init(payer: Address, amount: UFix64, productId: String, timestamp: UFix64) {
            self.payer = payer
            self.amount = amount
            self.productId = productId
            self.timestamp = timestamp
            self.verified = false
        }

        access(all) fun verifyPayment() {
            self.verified = true
        }
    }

    access(all) let admin: Address
    access(all) var payments: {Address: @Payment}

    pub event PaymentReceived(payer: Address, amount: UFix64, productId: String, timestamp: UFix64)
    pub event PaymentVerified(payer: Address, productId: String)

    init() {
        self.admin = self.account.address
        self.payments = {}
    }

    pub fun createPayment(payer: Address, amount: UFix64, productId: String, timestamp: UFix64) {
        if self.payments[payer] != nil {
            panic("Payment already exists for this address. Try verifying it.")
        }

        let newPayment <- create Payment(payer: payer, amount: amount, productId: productId, timestamp: timestamp)
        self.payments[payer] <-! newPayment

        emit PaymentReceived(payer: payer, amount: amount, productId: productId, timestamp: timestamp)
    }

    pub fun verifyPayment(payer: Address) {
        pre {
            self.admin == self.account.address: "Unauthorized. Only the admin can verify payments."
        }

        if self.payments[payer] == nil {
            panic("No payment found for this address. Please ensure the payment was created.")
        }

        let payment <- self.payments.remove(key: payer) ?? panic("No payment found for this address")

        let paymentLifespan: UFix64 = 30.0 * 24.0 * 60.0 * 60.0
        let currentTime = getCurrentBlock().timestamp
        if currentTime - payment.timestamp > paymentLifespan {
            panic("Payment verification period has expired.")
        }

        payment.verifyPayment()

        emit PaymentVerified(payer: payment.payer, productId: payment.productId)

        self.payments[payer] <-! payment
    }

    pub fun getPaymentDetails(payer: Address): PaymentInfo? {
        let payment = self.payments[payer]
        if payment == nil {
            return nil
        }

        return PaymentInfo(
            payer: payment!.payer,
            amount: payment!.amount,
            productId: payment!.productId,
            timestamp: payment!.timestamp,
            verified: payment!.verified
        )
    }

    pub fun auditPayments(): [PaymentInfo] {
        pre {
            self.admin == self.account.address: "Unauthorized. Only the admin can audit payments."
        }

        let paymentList: [PaymentInfo] = []

        for payer in self.payments.keys {
            let payment = self.payments[payer]!
            paymentList.append(PaymentInfo(
                payer: payment.payer,
                amount: payment.amount,
                productId: payment.productId,
                timestamp: payment.timestamp,
                verified: payment.verified
            ))
        }

        return paymentList
    }

    pub fun removePayment(payer: Address) {
        pre {
            self.admin == self.account.address: "Unauthorized. Only the admin can remove payments."
        }

        let payment <- self.payments.remove(key: payer) ?? panic("No payment found for this address")
        destroy payment
    }

    pub fun removeExpiredPayments() {
        pre {
            self.admin == self.account.address: "Unauthorized. Only the admin can remove expired payments."
        }

        let currentTime = getCurrentBlock().timestamp
        let paymentLifespan: UFix64 = 30.0 * 24.0 * 60.0 * 60.0

        for payer in self.payments.keys {
            let payment = self.payments[payer]!
            if currentTime - payment.timestamp > paymentLifespan {
                let expiredPayment <- self.payments.remove(key: payer)!
                destroy expiredPayment
            }
        }
    }
}
