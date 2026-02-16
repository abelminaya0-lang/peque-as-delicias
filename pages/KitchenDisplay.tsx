
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderService } from '../services/orderService';

const KitchenDisplay: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Initial Load
    setOrders(orderService.getOrders());
    
    // Subscribe to updates
    orderService.onUpdate((updatedOrders) => {
      setOrders(updatedOrders);
    });

    // Handle local storage changes from same tab
    const interval = setInterval(() => {
      const current = orderService.getOrders();
      setOrders(current);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const sortedOrders = [...activeOrders].sort((a, b) => a.createdAt - b.createdAt);

  const updateStatus = (id: string, nextStatus: Order['status']) => {
    orderService.updateOrderStatus(id, nextStatus);
    setOrders(orderService.getOrders());
  };

  const getTimeElapsed = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    return `${minutes}m`;
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-900 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></span>
          COCINA EN VIVO
        </h1>
        <div className="flex gap-4">
          <div className="bg-slate-800 px-6 py-2 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest block">Pendientes</span>
            <span className="text-white text-xl font-black">{activeOrders.length}</span>
          </div>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
          <span className="text-6xl mb-4">💤</span>
          <p className="text-xl font-bold">No hay órdenes pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 pb-8">
          {sortedOrders.map((order) => (
            <div key={order.id} className="bg-slate-800 rounded-[2rem] overflow-hidden flex flex-col border border-slate-700 shadow-2xl animate-fade-in">
              <div className={`p-5 flex justify-between items-start ${order.status === 'preparing' ? 'bg-orange-500' : 'bg-red-600'}`}>
                <div>
                  <h3 className="text-white text-3xl font-black leading-none">#{order.orderNumber}</h3>
                  <p className="text-white/80 font-bold text-sm mt-1 uppercase tracking-wider">{order.customerName}</p>
                </div>
                <div className="bg-black/20 px-3 py-1 rounded-full text-white font-black text-xs">
                  {getTimeElapsed(order.createdAt)}
                </div>
              </div>

              <div className="flex-1 p-6 space-y-4">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-700 text-white font-black flex items-center justify-center text-sm">
                            {item.quantity}
                          </span>
                          <span className="text-white font-bold group-hover:text-red-400 transition-colors uppercase">
                            {item.name}
                          </span>
                        </div>
                      </div>
                      {item.selectedOption && (
                        <div className="ml-11 mt-1">
                          <span className="bg-slate-700 text-orange-400 text-[10px] font-black px-2 py-0.5 rounded border border-slate-600 uppercase tracking-widest">
                            Opción: {item.selectedOption}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                {order.status === 'pending' ? (
                  <button 
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-lg hover:bg-orange-400 hover:text-white transition-all transform active:scale-95"
                  >
                    PREPARAR
                  </button>
                ) : (
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-600 transition-all shadow-lg shadow-green-900/40 transform active:scale-95"
                  >
                    LISTO PARA ENTREGAR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
