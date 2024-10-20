import React from 'react';
import CannabisEcommerce from './components/CannabisEcommerce';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-800 text-white p-4">
        <h1 className="text-3xl font-bold">GreenChain</h1>
      </header>
      <main className="flex-grow bg-gray-100">
        <CannabisEcommerce />
      </main>
      <footer className="bg-green-800 text-white p-4 text-center">
        <p>&copy; 2024 Cannabis E-commerce. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
