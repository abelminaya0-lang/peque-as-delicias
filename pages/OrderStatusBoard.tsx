
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types.ts';
import { orderService } from '../services/orderService.ts';

const OrderStatusBoard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Suscripción reactiva al servicio de pedidos
    orderService.onUpdate(setOrders);
    
    // Actualización del cronómetro cada segundo
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateStatus = (id: string, status: OrderStatus) => {
    orderService.updateOrderStatus(id, status);
  };

  const formatTime = (createdAt: number) => {
    const diff = Math.max(0, now - createdAt);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Filtramos pedidos activos (no entregados)
  const preparing = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* SECCIÓN: EN PREPARACIÓN */}
      <div className="flex-[1.2] flex flex-col border-r border-slate-200">
        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-end">
          <div>
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Cocinando</h2>
            <p className="font-brand text-red-600 text-2xl italic mt-2">de Ivanna</p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">En proceso</span>
            <div className="text-4xl font-black text-slate-900 tabular-nums">{preparing.length}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 gap-6 bg-slate-50/50">
          {preparing.map(o => (
            <div key={o.id} className={`bg-white rounded-[3rem] shadow-xl border-4 transition-all duration-500 overflow-hidden flex flex-col ${o.status === 'preparing' ? 'border-orange-400 ring-4 ring-orange-100' : 'border-white'}`}>
              <div className="p-8 flex justify-between items-start">
                <div className="flex gap-6 items-center">
                  <div className="text-8xl font-black text-slate-900 tracking-tighter leading-none">#{o.orderNumber}</div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 uppercase tracking-tight">{o.customerName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${o.status === 'preparing' ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {o.status === 'preparing' ? 'En el fuego' : 'Esperando turno'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* CRONOMETRO */}
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
                  <span className="text-red-500 animate-pulse">⏱</span>
                  <span className="font-mono text-3xl font-black tracking-widest">{formatTime(o.createdAt)}</span>
                </div>
              </div>

              {/* LISTA DE PRODUCTOS */}
              <div className="px-8 pb-6 flex-1">
                <div className="bg-slate-50 rounded-3xl p-6 space-y-3 border border-slate-100">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-xs border border-slate-100">{item.quantity}</span>
                        <span className="font-bold text-slate-700 uppercase text-sm tracking-tight">{item.name}</span>
                        {item.selectedOption && <span className="text-[10px] font-black text-red-500 border border-red-100 px-2 py-0.5 rounded-full uppercase">{item.selectedOption}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACCIONES */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                {o.status === 'pending' ? (
                  <button 
                    onClick={() => updateStatus(o.id, 'preparing')}
                    className="col-span-2 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-100"
                  >
                    ▶ Iniciar Preparación
                  </button>
                ) : (
                  <button 
                    onClick={() => updateStatus(o.id, 'ready')}
                    className="col-span-2 bg-green-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-green-600 transition-all uppercase tracking-widest shadow-lg shadow-green-100"
                  >
                    ✔ ¡Terminado / Listo!
                  </button>
                )}
              </div>
            </div>
          ))}
          {preparing.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <span className="text-9xl mb-4">✨</span>
              <p className="text-2xl font-black uppercase tracking-widest">Sin pedidos pendientes</p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN: LISTOS PARA RECOGER */}
      <div className="flex-1 flex flex-col bg-red-600">
        <div className="p-8 bg-red-700/30 backdrop-blur-md border-b border-white/10 flex justify-between items-end">
          <div>
            <h2 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">Listos</h2>
            <p className="text-red-200 font-bold text-xl uppercase tracking-widest mt-2">¡A comer!</p>
          </div>
          <div className="text-right">
            <span className="text-red-200 font-black text-[10px] uppercase tracking-[0.4em]">Por entregar</span>
            <div className="text-4xl font-black text-white tabular-nums">{ready.length}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {ready.map(o => (
            <div key={o.id} className="bg-white rounded-[4rem] p-10 shadow-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group border-8 border-white">
              <div className="flex flex-col items-center text-center">
                <div className="text-[10rem] font-black text-red-600 leading-none tracking-tighter">#{o.orderNumber}</div>
                <div className="text-3xl font-black text-slate-900 uppercase tracking-tighter mt-4">{o.customerName}</div>
                
                <div className="w-full mt-8 pt-8 border-t border-slate-100">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Contenido</p>
                   <div className="flex flex-wrap justify-center gap-2">
                     {o.items.map((i, idx) => (
                       <span key={idx} className="bg-slate-100 px-4 py-2 rounded-full text-xs font-black text-slate-600 uppercase">
                         {i.quantity}x {i.name}
                       </span>
                     ))}
                   </div>
                </div>

                <button 
                  onClick={() => updateStatus(o.id, 'delivered')}
                  className="w-full mt-10 bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest hover:bg-green-500 transition-all shadow-xl"
                >
                  Entregado ✓
                </button>
              </div>

              {/* Overlay de confirmación rápida */}
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
            </div>
          ))}
          {ready.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
              <span className="text-[12rem] leading-none mb-4">🔔</span>
              <p className="text-2xl font-black uppercase tracking-widest">Esperando salida</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusBoard;
