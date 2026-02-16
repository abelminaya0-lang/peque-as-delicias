
import React, { useState, useEffect } from 'react';
import { Order } from '../types.ts';
import { orderService } from '../services/orderService.ts';

const OrderStatusBoard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Carga inicial y suscripción a cambios de órdenes
    setOrders(orderService.getOrders());
    orderService.onUpdate(setOrders);
    
    // Intervalo para actualizar el cronómetro cada segundo
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Intervalo de respaldo para sincronización forzada de órdenes
    const syncInterval = setInterval(() => {
      setOrders(orderService.getOrders());
    }, 5000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const preparing = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  const deliverOrder = (id: string) => {
    orderService.updateOrderStatus(id, 'delivered');
  };

  const formatTime = (createdAt: number) => {
    const diff = Math.max(0, now - createdAt);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Columna Preparando con Cronómetro */}
      <div className="flex-1 p-8 md:p-16 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 overflow-y-auto">
        <div className="flex flex-col mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-5 h-5 rounded-full bg-orange-400 animate-pulse"></div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-800 uppercase tracking-tighter leading-none">Cocinando</h2>
          </div>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest ml-9">Tiempo en preparación</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {preparing.map(o => (
            <div 
              key={o.id} 
              className="bg-white p-10 rounded-[3.5rem] shadow-xl border-2 border-slate-50 flex flex-col items-center justify-center relative overflow-hidden group transition-all"
            >
              {/* Indicador de estado */}
              <div className={`absolute top-0 left-0 w-full h-2 ${o.status === 'preparing' ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
              
              <span className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">#{o.orderNumber}</span>
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest mt-4 mb-6">{o.customerName}</span>
              
              {/* Cronómetro Digital */}
              <div className="flex items-center gap-3 bg-slate-900 px-8 py-3 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform">
                <span className="text-red-500 animate-pulse text-xl">⏱</span>
                <span className="font-mono text-3xl font-black text-white tracking-widest">
                  {formatTime(o.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {preparing.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-20">
               <span className="text-8xl mb-4">✨</span>
               <p className="text-slate-900 font-black text-2xl uppercase tracking-tighter">Cocina despejada</p>
            </div>
          )}
        </div>
      </div>

      {/* Columna Listos para Entrega */}
      <div className="flex-1 p-8 md:p-16 bg-red-600 overflow-y-auto">
        <div className="flex flex-col mb-12">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-5 h-5 rounded-full bg-white animate-ping"></div>
             <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">¡Recógelo!</h2>
          </div>
          <p className="text-red-200 font-bold uppercase text-xs tracking-widest ml-9">Listos para disfrutar</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ready.map(o => (
            <div 
              key={o.id} 
              onClick={() => deliverOrder(o.id)}
              className="bg-white p-12 rounded-[4rem] shadow-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-105 transition-all group relative border-4 border-white active:scale-95 overflow-hidden"
            >
              <div className="absolute top-6 left-6 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-8xl md:text-[10rem] font-black text-red-600 tracking-tighter leading-none">#{o.orderNumber}</span>
              <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter mt-4">{o.customerName}</span>
              
              <div className="absolute inset-0 bg-green-500 rounded-[3.5rem] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 border-8 border-white">
                <span className="text-white text-4xl font-black tracking-tighter uppercase mb-1">¡ENTREGAR!</span>
                <span className="text-white/80 text-sm font-bold uppercase tracking-widest">Haz click al recibir</span>
              </div>
            </div>
          ))}
          {ready.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-30">
               <span className="text-9xl mb-6">🍽️</span>
               <p className="text-white font-black text-3xl uppercase tracking-tighter text-center leading-none">Esperando más <br/>Delicias de Ivanna</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusBoard;
