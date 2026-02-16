
import React, { useState, useEffect } from 'react';
import { Order } from '../types.ts';
import { orderService } from '../services/orderService.ts';

const KitchenDisplay: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Suscripción en tiempo real
    orderService.onUpdate((updatedOrders) => {
      setOrders(updatedOrders);
    });

    // Actualizar 'now' para el badge de "Nuevo" cada 5 segundos
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const sortedOrders = [...activeOrders].sort((a, b) => a.createdAt - b.createdAt);

  const updateStatus = (id: string, nextStatus: Order['status']) => {
    orderService.updateOrderStatus(id, nextStatus);
  };

  const getTimeElapsed = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    return `${minutes}m`;
  };

  const isNewOrder = (timestamp: number) => {
    return (Date.now() - timestamp) < 45000; // Menos de 45 segundos es "NUEVO"
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-950 p-6 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="text-white font-black text-xl italic">Iv</span>
          </div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></span>
            Cocina en Tiempo Real
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 px-8 py-3 rounded-2xl border border-slate-800 shadow-inner flex items-center gap-4">
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Pendientes</span>
            <span className="text-red-500 text-3xl font-black tabular-nums leading-none">{activeOrders.length}</span>
          </div>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-700 opacity-30">
          <span className="text-9xl mb-6">🥘</span>
          <p className="text-3xl font-black uppercase tracking-widest">Esperando pedidos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto pr-2 pb-12 hide-scrollbar">
          {sortedOrders.map((order) => {
            const isNew = isNewOrder(order.createdAt);
            return (
              <div 
                key={order.id} 
                className={`bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col border-4 transition-all duration-500 transform ${
                  isNew 
                  ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.3)] scale-[1.02] animate-pulse' 
                  : 'border-slate-800 shadow-2xl'
                }`}
              >
                {/* Header del Pedido */}
                <div className={`p-6 flex justify-between items-start ${order.status === 'preparing' ? 'bg-orange-500' : 'bg-red-600'} text-white`}>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-5xl font-black leading-none tracking-tighter">#{order.orderNumber}</h3>
                      {isNew && (
                        <span className="bg-white text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase animate-bounce shadow-lg">¡NUEVO!</span>
                      )}
                    </div>
                    <p className="text-white/80 font-black text-sm mt-2 uppercase tracking-widest">{order.customerName}</p>
                  </div>
                  <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white font-black text-[10px] border border-white/20">
                    HACE {getTimeElapsed(order.createdAt)}
                  </div>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 p-8 space-y-4 bg-slate-900/50">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col p-4 bg-slate-950 rounded-2xl border border-slate-800/50 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black flex items-center justify-center text-lg border border-slate-700">
                              {item.quantity}
                            </span>
                            <span className="text-white font-black text-xl group-hover:text-red-400 transition-colors uppercase tracking-tight">
                              {item.name}
                            </span>
                          </div>
                        </div>
                        {item.selectedOption && (
                          <div className="ml-14 mt-2">
                            <span className="bg-red-600/10 text-red-500 text-[11px] font-black px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">
                              {item.selectedOption}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-6 bg-slate-950 border-t border-slate-800">
                  {order.status === 'pending' ? (
                    <button 
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-lg hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 shadow-xl uppercase tracking-widest"
                    >
                      Empezar Cocina
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateStatus(order.id, 'ready')}
                      className="w-full bg-green-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-green-600 transition-all shadow-lg shadow-green-900/20 transform active:scale-95 uppercase tracking-widest"
                    >
                      ¡Plato Listo!
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
