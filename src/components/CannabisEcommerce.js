import React, { useState } from 'react';
import ProductList from './ProductList';
import Cart from './Cart';
import Checkout from './Checkout';

const CannabisEcommerce = () => {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (product, quantity) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const proceedToCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!showCheckout ? (
        <div className="flex flex-col md:flex-row gap-8">
          <ProductList addToCart={addToCart} />
          <Cart 
            cart={cart} 
            removeFromCart={removeFromCart} 
            updateQuantity={updateQuantity}
            proceedToCheckout={proceedToCheckout}
          />
        </div>
      ) : (
        <Checkout cart={cart} />
      )}
    </div>
  );
};

export default CannabisEcommerce;