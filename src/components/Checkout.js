import React, { useState, useEffect } from 'react';
import { initializeFlow, checkFlowBalance, executeFlowPayment, getCurrentUser, logOut } from '../utils/flowIntegration';
import { initializeCircleWallet, getCircleWalletBalance, createCirclePayment, initiateCrossChainTransfer } from '../utils/circleIntegration';

import { makePayment } from '../proof_of_green/src/ProofOfGreenIntegration';

const Checkout = ({ cart }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [flowUser, setFlowUser] = useState(null);
  const [flowBalance, setFlowBalance] = useState(null);
  const [circleWallet, setCircleWallet] = useState(null);
  const [circleBalance, setCircleBalance] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [sourceChain, setSourceChain] = useState('ETH');
  const [destinationChain, setDestinationChain] = useState('ETH');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      setFlowUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (flowUser && flowUser.addr) {
      checkFlowBalance(flowUser.addr).then(setFlowBalance);
    }
  }, [flowUser]);

  useEffect(() => {
    if (circleWallet) {
      fetchCircleBalance();
    }
  }, [circleWallet]);

  const fetchCircleBalance = async () => {
    try {
      const balance = await getCircleWalletBalance(circleWallet.id);
      setCircleBalance(balance);
    } catch (error) {
      console.error("Error fetching Circle balance:", error);
      setError("Failed to fetch Circle wallet balance. Please try again.");
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const recipientAddress = "0x1234567890abcdef"; // Replace with the actual recipient address
      await makePayment(totalAmount.toFixed(8), recipientAddress);
      // Handle successful payment (e.g., clear cart, show success message)
    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowLogin = async () => {
    try {
      await initializeFlow();
      const user = await getCurrentUser();
      setFlowUser(user);
    } catch (error) {
      console.error("Error logging in to Flow:", error);
      setError("Failed to log in to Flow. Please try again.");
    }
  };

  const handleFlowLogout = async () => {
    try {
      await logOut();
      setFlowUser(null);
      setFlowBalance(null);
    } catch (error) {
      console.error("Error logging out from Flow:", error);
      setError("Failed to log out from Flow. Please try again.");
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      switch(paymentMethod) {
        case 'flow':
          if (!flowUser) {
            throw new Error("Please connect your Flow wallet first");
          }
          
          if (flowBalance < total) {
            throw new Error(`Insufficient FLOW balance. You need at least ${total} FLOW.`);
          }

          const result = await executeFlowPayment(total);
          console.log("Flow payment result:", result);
          alert("Payment successful!");
          break;
        case 'circle':
          if (!circleWallet) {
            throw new Error("Please connect your Circle wallet first");
          }
          
          // Replace with your store's wallet address
          const storeAddress = "0x1234567890abcdef";
          
          if (sourceChain === destinationChain) {
            // Regular payment on the same chain
            const payment = await createCirclePayment(
              circleWallet.id,
              total,
              selectedCurrency,
              storeAddress,
              sourceChain
            );
            console.log("Circle payment initiated:", payment);
          } else {
            // Cross-chain transfer
            const transfer = await initiateCrossChainTransfer(
              sourceChain,
              destinationChain,
              total,
              storeAddress
            );
            console.log("Cross-chain transfer initiated:", transfer);
          }
          alert("Payment successful!");
          break;
        default:
          throw new Error('Please select a payment method');
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const connectCircleWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real application, you'd use a real user ID
      const userId = 'user-' + Math.random().toString(36).substr(2, 9);
      const wallet = await initializeCircleWallet(userId);
      setCircleWallet(wallet);
    } catch (error) {
      console.error("Error connecting Circle wallet:", error);
      setError("Failed to connect Circle wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      <div className="cart-summary">
        {cart.map(item => (
          <div key={item.id}>
            <span>{item.name}</span>
            <span>{item.quantity} x ${item.price.toFixed(2)}</span>
          </div>
        ))}
        <p><strong>Total: ${total.toFixed(2)}</strong></p>
      </div>
      <div className="payment-options">
        <h3>Select Payment Method</h3>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Select a payment method</option>
          <option value="flow">Pay with FLOW</option>
          <option value="circle">Pay with USDC or other cryptocurrencies via Circle</option>
        </select>
      </div>
      {paymentMethod === 'flow' && (
        <div className="flow-wallet-section">
          {flowUser ? (
            <div>
              <p>Connected Flow Address: {flowUser.addr}</p>
              {flowBalance !== null && <p>Balance: {flowBalance} FLOW</p>}
              <button onClick={handleFlowLogout}>Disconnect Flow Wallet</button>
            </div>
          ) : (
            <button onClick={handleFlowLogin}>Connect Flow Wallet</button>
          )}
        </div>
      )}
      {paymentMethod === 'circle' && (
        <div className="circle-wallet-section">
          {circleWallet ? (
            <div>
              <p>Connected Circle Wallet ID: {circleWallet.id}</p>
              {circleBalance && <p>Balance: {circleBalance.amount} {circleBalance.currency}</p>}
              <div>
                <label>Currency:</label>
                <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
              <div>
                <label>Source Chain:</label>
                <select value={sourceChain} onChange={(e) => setSourceChain(e.target.value)}>
                  <option value="ETH">Ethereum</option>
                  <option value="SOL">Solana</option>
                  <option value="TRX">TRON</option>
                  <option value="AVAX">Avalanche</option>
                </select>
              </div>
              <div>
                <label>Destination Chain:</label>
                <select value={destinationChain} onChange={(e) => setDestinationChain(e.target.value)}>
                  <option value="ETH">Ethereum</option>
                  <option value="SOL">Solana</option>
                  <option value="TRX">TRON</option>
                  <option value="AVAX">Avalanche</option>
                </select>
              </div>
              {sourceChain !== destinationChain && (
                <p>Cross-chain transfer will be initiated from {sourceChain} to {destinationChain}</p>
              )}
            </div>
          ) : (
            <button onClick={connectCircleWallet} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect Circle Wallet'}
            </button>
          )}
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <button onClick={handlePayment} disabled={isLoading || !paymentMethod || (paymentMethod === 'flow' && !flowUser) || (paymentMethod === 'circle' && !circleWallet)}>
        {isLoading ? 'Processing...' : 'Complete Payment'}
      </button>
    </div>
  );
};

export default Checkout;
