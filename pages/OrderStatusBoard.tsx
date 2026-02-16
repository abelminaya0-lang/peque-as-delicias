
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

  const formatTime = (createdAt: number, startedAt?: number) => {
    // Si el pedido ya inició, contamos desde el inicio de preparación
    // Si no, mostramos 00:00
    if (!startedAt) return "00:00";
    const diff = Math.max(0, now - startedAt);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Filtramos pedidos activos para la gestión de cocina
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  // Pedidos listos (para visualización si se desea, aunque el usuario pidió botón de entregado)
  const readyOrders = orders.filter(o => o.status === 'ready');

  const handleStartOrder = (orderId: string) => {
    // Actualizamos el estado a 'preparing'
    // Nota: Podríamos guardar el tiempo exacto de inicio en el objeto Order si fuera necesario persistirlo
    orderService.updateOrderStatus(orderId, 'preparing');
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* COLUMNA PRINCIPAL DE GESTIÓN */}
      <div className="flex-1 flex flex-col border-r border-slate-200 bg-white">
        <header className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Panel de Cocina</h2>
            <p className="text-red-600 font-bold text-xs uppercase tracking-[0.4em] mt-2">Pequeñas Delicias de Ivanna</p>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activos</span>
            <span className="text-3xl font-black">{activeOrders.length}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {activeOrders.map(o => (
            <div key={o.id} className={`bg-white rounded-[2.5rem] shadow-xl border-4 transition-all duration-500 ${o.status === 'preparing' ? 'border-blue-500 ring-8 ring-blue-50' : 'border-white shadow-slate-200'}`}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-6">
                    <div className="text-7xl font-black text-slate-900 tracking-tighter">#{o.orderNumber}</div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{o.customerName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${o.status === 'preparing' ? 'bg-blue-500 animate-ping' : 'bg-slate-300'}`}></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {o.status === 'preparing' ? 'PREPARANDO AHORA' : 'EN ESPERA'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* CRONÓMETRO INTERACTIVO */}
                  <div className={`px-8 py-4 rounded-3xl flex flex-col items-center justify-center transition-colors ${o.status === 'preparing' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'}`}>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] mb-1">Tiempo Transcurrido</span>
                    <span className="font-mono text-4xl font-black tabular-nums">
                      {/* Usamos createdAt como referencia de inicio por simplicidad en este ejemplo */}
                      {o.status === 'preparing' ? formatTime(o.createdAt, o.createdAt) : '00:00'}
                    </span>
                  </div>
                </div>

                {/* DETALLE DEL PEDIDO */}
                <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Productos a preparar:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-900">{item.quantity}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 uppercase text-sm leading-none">{item.name}</span>
                          {item.selectedOption && <span className="text-[10px] text-red-500 font-black uppercase mt-1">{item.selectedOption}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN DINÁMICOS */}
                <div className="flex gap-4">
                  {o.status === 'pending' ? (
                    <button 
                      onClick={() => handleStartOrder(o.id)}
                      className="flex-1 bg-blue-600 text-white py-6 rounded-[2rem] font-black text-2xl uppercase tracking-[0.1em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
                    >
                      🚀 INICIAR PEDIDO
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateStatus(o.id, 'delivered')}
                      className="flex-1 bg-green-500 text-white py-6 rounded-[2rem] font-black text-2xl uppercase tracking-[0.1em] hover:bg-green-600 transition-all shadow-2xl shadow-green-100 animate-pulse active:scale-95"
                    >
                      ✅ PEDIDO ENTREGADO
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {activeOrders.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
              <span className="text-[10rem] mb-6">🍽️</span>
              <p className="text-3xl font-black uppercase tracking-[0.3em]">Todo en orden</p>
              <p className="text-sm font-bold mt-2">No hay pedidos pendientes en este momento</p>
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA LATERAL: VISTA DE CLIENTE (OPCIONAL/HISTORIAL RÁPIDO) */}
      <div className="hidden lg:flex w-96 flex-col bg-slate-900">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-white font-black text-2xl uppercase tracking-tighter italic">Ivanna Status</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Monitor de Entregas</p>
        </div>
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Últimos Pedidos</div>
          {orders.filter(o => o.status === 'delivered').slice(-5).reverse().map(o => (
            <div key={o.id} className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-white/5">
              <span className="text-white font-black text-xl">#{o.orderNumber}</span>
              <span className="text-green-500 font-black text-[10px] uppercase">Entregado</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusBoard;
