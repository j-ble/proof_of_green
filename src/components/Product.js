import React, { useState } from 'react';

const Product = ({ product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />
      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-2">Type: {product.type}</p>
      <p className="text-gray-600 mb-2">Rating: {product.rating}/5</p>
      <p className="text-green-600 font-bold mb-4">${product.price.toFixed(2)}</p>
      <div className="flex items-center mb-4">
        <input 
          type="number" 
          min="1" 
          value={quantity} 
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-16 px-2 py-1 border rounded mr-2"
        />
        <button 
          onClick={handleAddToCart}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Product;
