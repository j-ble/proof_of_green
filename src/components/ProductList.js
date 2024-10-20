import React from 'react';
import Product from './Product';

const ProductList = ({ addToCart }) => {
  const products = [
    { id: 1, name: 'OG Kush', type: 'Bud', rating: 4.5, price: 15.99, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Sour Diesel', type: 'Bud', rating: 4.3, price: 14.99, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Gummy Bears', type: 'Edible', rating: 4.7, price: 19.99, image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'CBD Oil', type: 'Oil', rating: 4.8, price: 29.99, image: 'https://via.placeholder.com/150' },
  ];

  return (
    <div className="flex-grow">
      <h2 className="text-2xl font-bold mb-4">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <Product key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
