
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerMenu from './pages/CustomerMenu.tsx';
import KitchenDisplay from './pages/KitchenDisplay.tsx';
import OrderStatusBoard from './pages/OrderStatusBoard.tsx';
import { AppRoute } from './types.ts';

const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || 'menu';

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 transform -rotate-3 transition-transform hover:rotate-0 cursor-pointer">
            <span className="text-white font-black text-2xl italic">PD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">PEQUEÑAS</span>
            <span className="text-lg font-bold tracking-tighter text-red-600 leading-none">DELICIAS</span>
          </div>
        </div>
        
        <div className="flex gap-1 md:gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {[
            { id: AppRoute.MENU, label: 'Menú', emoji: '🍔' },
            { id: AppRoute.KITCHEN, label: 'Cocina', emoji: '👨‍🍳' },
            { id: AppRoute.STATUS, label: 'Pantalla', emoji: '📺' }
          ].map((item) => (
            <Link
              key={item.id}
              to={`/${item.id}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                currentPath === item.id 
                  ? 'bg-white text-red-600 shadow-sm scale-105 border border-red-50' 
                  : 'text-slate-400 hover:text-red-500'
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="hidden sm:inline uppercase tracking-tighter">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<CustomerMenu />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/kitchen" element={<KitchenDisplay />} />
            <Route path="/status" element={<OrderStatusBoard />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
