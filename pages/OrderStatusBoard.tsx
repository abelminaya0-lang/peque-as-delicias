
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderService } from '../services/orderService';

const OrderStatusBoard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(orderService.getOrders());
    orderService.onUpdate(setOrders);
    const interval = setInterval(() => setOrders(orderService.getOrders()), 2000);
    return () => clearInterval(interval);
  }, []);

  const preparing = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  const deliverOrder = (id: string) => {
    orderService.updateOrderStatus(id, 'delivered');
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Preparing Column */}
      <div className="flex-1 p-10 md:p-20 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4 mb-16">
           <div className="w-4 h-4 rounded-full bg-slate-300 animate-pulse"></div>
           <h2 className="text-6xl md:text-8xl font-black text-slate-300 uppercase tracking-tighter leading-none">Preparando</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
          {preparing.map(o => (
            <div key={o.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center animate-pulse group">
              <span className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter">#{o.orderNumber}</span>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-3">{o.customerName}</span>
            </div>
          ))}
          {preparing.length === 0 && <p className="col-span-full text-slate-200 font-black text-3xl uppercase tracking-tighter mt-10">Sin órdenes en cocina</p>}
        </div>
      </div>

      {/* Ready Column */}
      <div className="flex-1 p-10 md:p-20 bg-red-600 overflow-y-auto">
        <div className="flex items-center gap-4 mb-16">
           <div className="w-4 h-4 rounded-full bg-white animate-ping"></div>
           <h2 className="text-6xl md:text-8xl font-black text-white/20 uppercase tracking-tighter leading-none">Listos</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {ready.map(o => (
            <div 
              key={o.id} 
              onClick={() => deliverOrder(o.id)}
              className="bg-white p-12 rounded-[4rem] shadow-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-105 transition-all group relative border-4 border-white active:scale-95"
            >
              <div className="absolute top-6 left-6 w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-7xl md:text-9xl font-black text-red-600 tracking-tighter leading-none">#{o.orderNumber}</span>
              <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter mt-2">{o.customerName}</span>
              <div className="absolute inset-0 bg-red-600 rounded-[3.5rem] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 border-8 border-white">
                <span className="text-white text-4xl font-black tracking-tighter uppercase mb-1">¡RECOGER!</span>
                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Click para confirmar</span>
              </div>
            </div>
          ))}
          {ready.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
               <span className="text-9xl mb-4">🍽️</span>
               <p className="text-white font-black text-4xl uppercase tracking-tighter text-center leading-none">Esperando delicias...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusBoard;
