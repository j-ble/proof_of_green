const CIRCLE_API_BASE_URL = 'https://api-sandbox.circle.com/v1';
const CIRCLE_API_KEY = process.env.REACT_APP_CIRCLE_API_KEY;

if (!CIRCLE_API_KEY) {
  console.error('Circle API key is not set. Please set the REACT_APP_CIRCLE_API_KEY environment variable.');
}

const circleRequest = async (endpoint, method = 'GET', body = null) => {
  const url = `${CIRCLE_API_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in Circle API request to ${endpoint}:`, error);
    throw error;
  }
};

export const initializeCircleWallet = async (userId) => {
    console.log('Initializing Circle wallet for user:', userId);
    try {
      const response = await circleRequest('/wallets', 'POST', {
        idempotencyKey: `${userId}-${Date.now()}`,
        description: `Wallet for user ${userId}`
      });
      console.log('Circle wallet initialized:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initializing Circle wallet:', error);
      throw error;
    }
  };

export const getCircleWalletBalance = async (walletId) => {
    console.log('Fetching Circle wallet balance for wallet:', walletId);
    try {
      const response = await circleRequest(`/wallets/${walletId}/balances`);
      console.log('Circle wallet balance:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting Circle wallet balance:', error);
      throw error;
    }
  };

export const createCirclePayment = async (walletId, amount, currency, destinationAddress, chain) => {
    console.log('Creating Circle payment:', { walletId, amount, currency, destinationAddress, chain });
    try {
      const response = await circleRequest('/payments', 'POST', {
        idempotencyKey: `payment-${Date.now()}`,
        amount: {
          amount: amount.toString(),
          currency: currency
        },
        source: {
          type: 'wallet',
          id: walletId
        },
        destination: {
          type: 'blockchain',
          address: destinationAddress,
          chain: chain
        }
      });
      console.log('Circle payment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Circle payment:', error);
      throw error;
    }
  };

export const initiateCrossChainTransfer = async (sourceChain, destinationChain, amount, destinationAddress) => {
  try {
    const response = await circleRequest('/transfers', 'POST', {
      idempotencyKey: `transfer-${Date.now()}`,
      source: {
        type: 'wallet',
        id: sourceChain
      },
      destination: {
        type: 'blockchain',
        address: destinationAddress,
        chain: destinationChain
      },
      amount: {
        amount: amount.toString(),
        currency: 'USD'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error initiating cross-chain transfer:', error);
    throw error;
  }
};