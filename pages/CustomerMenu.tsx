
import React, { useState, useMemo } from 'react';
import { MENU_ITEMS, CATEGORIES } from '../data.ts';
import { MenuItem, CartItem, Order } from '../types.ts';
import { orderService } from '../services/orderService.ts';

const CustomerMenu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);
  const [itemWithOptions, setItemWithOptions] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => 
    MENU_ITEMS.filter(item => item.category === selectedCategory),
    [selectedCategory]
  );
  
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
    setTimeout(() => setOrderConfirmed(null), 8000);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-white overflow-hidden font-sans">
      
      {/* CATEGORÍAS */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-100 p-4 md:p-8 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar z-10">
        <div className="hidden md:block mb-8">
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Ivanna</h2>
           <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mt-1">Nuestra Carta</p>
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 md:w-full px-6 py-4 rounded-2xl text-xs font-black transition-all text-center md:text-left uppercase tracking-widest border-2 ${
              selectedCategory === cat 
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white border-slate-50 text-slate-400 hover:border-red-500 hover:text-red-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 px-6 py-8 md:p-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedCategory}</h1>
              <div className="h-1.5 w-16 bg-red-600 rounded-full mt-4"></div>
          </header>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-48">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="group cursor-pointer relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-red-50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-slate-900 font-black text-lg shadow-sm">
                    S/ {item.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">{item.name}</h3>
                  <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2">{item.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                     <span className="text-red-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">Lo quiero →</span>
                     <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-red-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CARRITO FLOTANTE */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-3 flex items-center justify-between border-2 border-slate-50 animate-slide-up z-40">
          <div className="flex items-center gap-4 pl-4">
             <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                {cart.reduce((a, b) => a + b.quantity, 0)}
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Total actual</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">S/ {cartTotal.toFixed(2)}</span>
             </div>
          </div>
          <button 
            onClick={() => setIsCheckoutModalOpen(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl active:scale-95"
          >
            Ver Mi Pedido
          </button>
        </div>
      )}

      {/* MODAL DE OPCIONES */}
      {itemWithOptions && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-slide-up">
            <h2 className="text-3xl font-black text-slate-900 mb-6 text-center uppercase tracking-tighter">¿Cómo lo prefieres?</h2>
            <div className="grid gap-3">
              {itemWithOptions.options?.map(opt => (
                <button
                  key={opt}
                  onClick={() => addToCart(itemWithOptions, opt)}
                  className="bg-slate-50 hover:bg-red-600 hover:text-white p-6 rounded-2xl font-black text-xl text-slate-900 transition-all text-left flex justify-between items-center group border border-slate-100"
                >
                  <span className="uppercase">{opt}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-2xl">➕</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setItemWithOptions(null)}
              className="w-full mt-6 text-slate-300 font-black hover:text-red-600 transition-colors uppercase text-[10px] tracking-widest"
            >
              Regresar al Menú
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT FINAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-slide-up">
            <header className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Tu Pedido</h2>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1">Confirma antes de enviar</p>
              </div>
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-50/30">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {item.category === 'Bebés' ? '🍼' : item.category === 'Bebidas' ? '🥤' : '🍕'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-slate-900 uppercase leading-none">{item.name}</h4>
                    {item.selectedOption && <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{item.selectedOption}</span>}
                    <div className="mt-1 text-xs font-bold text-slate-400">S/ {item.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                     <button onClick={() => updateQuantity(item.id, -1, item.selectedOption)} className="w-6 h-6 rounded-md bg-white font-black hover:text-red-600 transition-colors shadow-sm">-</button>
                     <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, 1, item.selectedOption)} className="w-6 h-6 rounded-md bg-white font-black hover:text-red-600 transition-colors shadow-sm">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.selectedOption)} className="p-2 text-slate-200 hover:text-red-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}

              <div className="mt-8 pt-8">
                <button 
                   onClick={() => setIsCheckoutModalOpen(false)}
                   className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:border-red-300 hover:text-red-500 transition-all flex items-center justify-center gap-3"
                >
                   <span>➕ Seguir Comprando</span>
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Indica tu nombre para el pedido</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ESCRIBE TU NOMBRE AQUÍ..."
                  className="w-full bg-slate-900 border-4 border-slate-800 rounded-3xl p-6 font-black text-2xl text-white text-center outline-none focus:border-red-600 transition-all placeholder:text-slate-700 uppercase"
                />
              </div>
            </div>

            <footer className="p-8 bg-white border-t border-slate-50">
              <div className="flex justify-between items-center mb-6 px-4">
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Final</span>
                <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">S/ {cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={!customerName.trim() || cart.length === 0}
                className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] hover:bg-red-700 transition-all disabled:opacity-20 shadow-2xl shadow-red-200 active:scale-95 transform"
              >
                ¡CONFIRMAR PEDIDO! 🚀
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE ÉXITO */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-white animate-fade-in">
          <div className="bg-white flex flex-col items-center text-center max-w-lg w-full">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-6xl text-white shadow-2xl animate-bounce mb-8">✓</div>
            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">¡PEDIDO ENVIADO!</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest mb-10 leading-relaxed">
              Gracias <span className="text-red-600">{orderConfirmed.customerName}</span>,<br/>tu orden ya está en nuestra cocina.
            </p>
            
            <div className="relative group">
               <div className="absolute -inset-4 bg-red-600/10 rounded-[3.5rem] animate-pulse"></div>
               <div className="relative bg-white text-red-600 px-16 py-10 rounded-[3rem] font-black text-9xl tracking-tighter border-4 border-red-600 shadow-2xl">
                 #{orderConfirmed.orderNumber}
               </div>
            </div>
            
            <p className="mt-14 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] leading-relaxed">Atento a la pantalla gigante para recogerlo.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
