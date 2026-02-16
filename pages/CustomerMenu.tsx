
import React, { useState } from 'react';
import { MENU_ITEMS, CATEGORIES } from '../data.ts';
import { MenuItem, CartItem, Order } from '../types.ts';
import { orderService } from '../services/orderService.ts';

const CustomerMenu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Comidas');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);
  const [itemWithOptions, setItemWithOptions] = useState<MenuItem | null>(null);

  const filteredItems = MENU_ITEMS.filter(item => item.category === selectedCategory);
  
  const addToCart = (item: MenuItem, selectedOption?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedOption === selectedOption);
      if (existing) {
        return prev.map(i => (i.id === item.id && i.selectedOption === selectedOption) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, selectedOption }];
    });
    setItemWithOptions(null);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      setItemWithOptions(item);
    } else {
      addToCart(item);
    }
  };

  const updateQuantity = (id: string, delta: number, option?: string) => {
    setCart(prev => prev.map(i => {
      if (i.id === id && i.selectedOption === option) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string, option?: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.selectedOption === option)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (!customerName.trim() || cart.length === 0) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: (Math.floor(Math.random() * 900) + 100).toString(),
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      createdAt: Date.now(),
      customerName: customerName.trim(),
    };
    orderService.addOrder(newOrder);
    setOrderConfirmed(newOrder);
    setCart([]);
    setIsCheckoutModalOpen(false);
    setCustomerName('');
    setTimeout(() => setOrderConfirmed(null), 6000);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden relative bg-white">
      {/* Sidebar Rojo/Blanco */}
      <div className="w-full md:w-64 bg-white border-r border-slate-50 p-6 flex md:flex-col gap-3 overflow-x-auto hide-scrollbar shrink-0">
        <div className="hidden md:block mb-8 px-2">
           <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-1">Categorías</h4>
           <div className="h-1 w-10 bg-red-600 rounded-full"></div>
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-8 py-5 rounded-[2.5rem] text-sm font-black transition-all text-left uppercase tracking-tighter ${
              selectedCategory === cat 
                ? 'bg-red-600 text-white shadow-2xl shadow-red-100 scale-105' 
                : 'text-slate-400 hover:text-red-600 hover:bg-red-50/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-slate-50/20">
        <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">LA CARTA</h1>
            <div className="flex items-center gap-3 mt-3">
               <span className="text-red-600 font-black text-xs uppercase tracking-[0.6em]">Pequeñas Delicias</span>
               <div className="h-px w-24 bg-red-100"></div>
            </div>
          </div>
          <div className="bg-white px-8 py-4 rounded-full shadow-sm border border-slate-100 flex items-center gap-4">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Servicio en Tiempo Real</span>
          </div>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pb-56">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-[4.5rem] overflow-hidden shadow-[0_20px_70px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(220,38,38,0.1)] transition-all duration-700 group border border-slate-50 flex flex-col h-[480px]"
            >
              <div className="h-64 overflow-hidden relative shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full text-red-600 font-black text-2xl shadow-2xl border-2 border-red-50">
                  S/ {item.price.toFixed(2)}
                </div>
              </div>
              <div className="p-10 flex flex-col flex-1 text-center">
                <h3 className="text-3xl font-black text-slate-900 mb-2 leading-none group-hover:text-red-600 transition-colors uppercase tracking-tighter">{item.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-8 font-medium italic">"{item.description}"</p>
                <button
                  onClick={() => handleItemClick(item)}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-red-600 transition-all shadow-xl active:scale-95 transform mt-auto"
                >
                  Agregar Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Opciones */}
      {itemWithOptions && (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[6rem] p-16 shadow-2xl border-[20px] border-red-50 animate-bounce-in">
            <div className="flex justify-center mb-10 text-9xl animate-pulse">
               {itemWithOptions.category === 'Bebés' ? '🍼' : '✨'}
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 text-center tracking-tighter uppercase">¿Qué prefieres?</h2>
            <p className="text-slate-400 mb-14 font-bold text-center uppercase text-[10px] tracking-[0.3em]">Selecciona una opción</p>
            <div className="grid grid-cols-1 gap-6">
              {itemWithOptions.options?.map(opt => (
                <button
                  key={opt}
                  onClick={() => addToCart(itemWithOptions, opt)}
                  className="bg-slate-50 hover:bg-red-600 hover:text-white p-10 rounded-[3.5rem] font-black text-3xl text-slate-900 transition-all text-left flex justify-between items-center group shadow-sm border-2 border-slate-100 hover:border-red-600"
                >
                  <span className="uppercase tracking-tighter">{opt}</span>
                  <div className="w-16 h-16 rounded-full bg-red-600/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <span className="text-red-600 group-hover:text-white text-3xl">→</span>
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setItemWithOptions(null)}
              className="w-full mt-14 text-slate-300 font-black hover:text-red-600 transition-colors py-2 uppercase text-[10px] tracking-[0.6em]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[94%] md:w-auto bg-white rounded-full shadow-[0_50px_100px_rgba(220,38,38,0.4)] p-5 flex items-center gap-14 border-8 border-red-50 animate-bounce-in z-50">
          <div className="relative ml-2">
             <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                {cart.reduce((a, b) => a + b.quantity, 0)}
             </div>
             <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col pr-6">
            <span className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em] mb-1">Monto a Pagar</span>
            <span className="text-6xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">S/ {cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setIsCheckoutModalOpen(true)}
            className="bg-slate-900 text-white px-24 py-8 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-red-600 transition-all shadow-2xl active:scale-95 transform mr-1"
          >
            Pagar Ahora
          </button>
        </div>
      )}

      {/* Order Status Modal */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-white/95 backdrop-blur-3xl animate-fade-in">
          <div className="bg-white p-24 rounded-[8rem] shadow-[0_100px_200px_rgba(220,38,38,0.25)] flex flex-col items-center gap-14 border-8 border-red-50 max-w-2xl w-full text-center">
            <div className="w-48 h-48 bg-green-500 rounded-full flex items-center justify-center text-9xl text-white shadow-3xl animate-bounce">✓</div>
            <div>
              <h2 className="text-8xl font-black tracking-tighter uppercase mb-4 text-slate-900">¡GRACIAS!</h2>
              <p className="font-bold text-3xl text-slate-400 uppercase tracking-widest leading-tight">Su orden de <br/><span className="text-red-600">Pequeñas Delicias</span> está siendo preparada</p>
            </div>
            <div className="bg-red-50 text-red-600 px-24 py-12 rounded-[6rem] font-black text-[10rem] shadow-inner tracking-tighter border-8 border-red-100 leading-none">
              #{orderConfirmed.orderNumber}
            </div>
            <p className="text-[14px] font-black uppercase tracking-[0.6em] text-slate-300 mt-4 leading-relaxed">Mostraremos su número en pantalla cuando esté listo</p>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[7rem] overflow-hidden shadow-2xl flex flex-col max-h-[96vh] border-[20px] border-white">
            <header className="p-16 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase">Tu Orden</h2>
                <div className="flex items-center gap-4 mt-4">
                   <div className="w-5 h-5 rounded-full bg-red-600 animate-pulse"></div>
                   <p className="text-slate-400 font-black text-xs uppercase tracking-[0.6em]">Premium Pequeñas Delicias</p>
                </div>
              </div>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="bg-slate-100 hover:bg-red-600 hover:text-white p-8 rounded-full transition-all active:scale-90">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-16 flex flex-col gap-14">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${item.selectedOption}-${idx}`} className="flex gap-14 items-center animate-fade-in">
                  <div className="w-40 h-40 bg-red-50/50 rounded-[5rem] flex items-center justify-center text-8xl shadow-inner shrink-0 border border-red-50">
                    {item.category === 'Bebés' ? '🍼' : item.category === 'Bebidas' ? '🥤' : '🍔'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                       <div>
                         <h4 className="font-black text-5xl text-slate-900 uppercase tracking-tighter leading-none">{item.name}</h4>
                         {item.selectedOption && (
                            <div className="mt-5">
                               <span className="bg-red-600 text-white px-8 py-3 rounded-full text-[14px] uppercase font-black tracking-widest shadow-xl">
                                {item.selectedOption}
                               </span>
                            </div>
                          )}
                       </div>
                       <span className="font-black text-5xl text-slate-900 tabular-nums tracking-tighter">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-16 mt-14">
                      <div className="flex items-center gap-12 bg-slate-50 p-5 rounded-[4rem] border border-slate-100 shadow-inner">
                        <button onClick={() => updateQuantity(item.id, -1, item.selectedOption)} className="w-20 h-20 rounded-[2.5rem] bg-white shadow-sm flex items-center justify-center font-black hover:bg-red-600 hover:text-white transition-all text-4xl">-</button>
                        <span className="font-black text-5xl w-16 text-center tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1, item.selectedOption)} className="w-20 h-20 rounded-[2.5rem] bg-white shadow-sm flex items-center justify-center font-black hover:bg-red-600 hover:text-white transition-all text-4xl">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.selectedOption)} className="text-slate-300 hover:text-red-600 font-black uppercase text-[14px] tracking-[0.4em] transition-colors border-b-4 border-transparent hover:border-red-600">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-14 pt-20 border-t border-slate-100">
                <label className="block text-md font-black text-slate-400 uppercase tracking-[0.8em] mb-12 text-center">Nombre para tu Pedido</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ESCRIBE AQUÍ..."
                  className="w-full bg-slate-50 border-8 border-transparent focus:border-red-600/20 rounded-[5rem] p-20 font-black text-6xl text-center focus:ring-0 outline-none transition-all placeholder:text-slate-200 uppercase tracking-tighter shadow-inner"
                />
              </div>
            </div>

            <footer className="p-16 bg-slate-900 border-t border-slate-800 flex flex-col gap-14">
              <div className="flex justify-between items-center px-10">
                <span className="text-slate-500 font-black uppercase tracking-[0.6em] text-lg">TOTAL FINAL</span>
                <span className="text-[9rem] font-black text-white tabular-nums tracking-tighter leading-none">S/ {cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={!customerName.trim() || cart.length === 0}
                className="w-full bg-red-600 text-white py-16 rounded-[5rem] font-black text-6xl hover:bg-red-700 transition-all disabled:opacity-5 shadow-[0_50px_100px_rgba(220,38,38,0.8)] active:scale-95 transform uppercase tracking-[0.1em]"
              >
                Pagar Ahora
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
