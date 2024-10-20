import React, { useState, useEffect } from 'react';
import { initializeFlow, checkFlowBalance, executeFlowPayment } from '../utils/flowIntegration';
import * as fcl from "@onflow/fcl";

const Checkout = ({ cart }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [flowUser, setFlowUser] = useState(null);
  const [flowBalance, setFlowBalance] = useState(null);

  useEffect(() => {
    fcl.currentUser().subscribe(setFlowUser);
  }, []);

  const handlePayment = async () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    switch(paymentMethod) {
      case 'flow':
        if (!flowUser || !flowUser.addr) {
          alert("Please connect your Flow wallet first");
          return;
        }
        
        try {
          const balance = await checkFlowBalance(flowUser.addr);
          if (balance < total) {
            alert("Insufficient USDC.e balance");
            return;
          }
          
          // Replace with your store's Flow address
          const storeAddress = "0x1234567890abcdef";
          await executeFlowPayment(total, storeAddress);
          alert("Payment successful!");
        } catch (error) {
          console.error("Flow payment error:", error);
          alert("Payment failed. Please try again.");
        }
        break;
      case 'circle':
        // Implement Circle payment logic
        console.log('Paying with USDC or other cryptocurrencies via Circle');
        break;
      case 'stripe':
        // Implement Stripe Crypto Onboarding logic
        console.log('Paying with cryptocurrencies via Stripe');
        break;
      default:
        console.log('Please select a payment method');
    }
  };

  const connectFlowWallet = () => {
    initializeFlow();
  };

  useEffect(() => {
    if (flowUser && flowUser.addr) {
      checkFlowBalance(flowUser.addr).then(setFlowBalance);
    }
  }, [flowUser]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      <div className="cart-summary">
        <h3>Cart Summary</h3>
        {cart.map(item => (
          <div key={item.id}>
            {item.name} - Quantity: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
          </div>
        ))}
        <p><strong>Total: ${total.toFixed(2)}</strong></p>
      </div>
      <div className="payment-options">
        <h3>Select Payment Method</h3>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Select a payment method</option>
          <option value="flow">Pay with USDC.e on Flow</option>
          <option value="circle">Pay with USDC or other cryptocurrencies via Circle</option>
          <option value="stripe">Pay with cryptocurrencies via Stripe</option>
        </select>
      </div>
      {paymentMethod === 'flow' && (
        <div className="flow-wallet-section">
          {flowUser && flowUser.addr ? (
            <div>
              <p>Connected Flow Address: {flowUser.addr}</p>
              {flowBalance !== null && <p>USDC.e Balance: {flowBalance}</p>}
            </div>
          ) : (
            <button onClick={connectFlowWallet}>Connect Flow Wallet</button>
          )}
        </div>
      )}
      <button onClick={handlePayment}>Complete Payment</button>
    </div>
  );
};

export default Checkout;