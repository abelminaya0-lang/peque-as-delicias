
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// --- TYPES ---
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  options?: string[];
}

interface CartItem extends MenuItem {
  quantity: number;
  selectedOption?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  customerName: string;
}

// --- DATA ---
const MENU_ITEMS: MenuItem[] = [
  { id: 'c1', name: 'Sopa', description: 'Sopa casera del día, caliente y nutritiva.', price: 6.00, category: 'Comidas', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400' },
  { id: 'c2', name: 'Perro Caliente', description: 'Hot dog clásico con salsas y papas al hilo.', price: 10.00, category: 'Comidas', image: 'https://images.unsplash.com/photo-1612392061787-2d078b3e573c?auto=format&fit=crop&q=80&w=400' },
  { id: 'c3', name: 'Pollo a la Brasa', description: 'Pollo marinado con nuestra receta secreta.', price: 11.00, category: 'Comidas', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=400' },
  { id: 'c5', name: 'Pizza', description: 'Pizza artesanal con mucho queso.', price: 7.00, category: 'Comidas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
  { id: 'b2', name: 'Jugo de Naranja', description: 'Jugo 100% natural recién exprimido.', price: 19.00, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1600271886399-0d2e824d5e1e?auto=format&fit=crop&q=80&w=400' },
  { id: 'b6', name: 'Chicha', description: 'Tradicional chicha morada artesanal.', price: 9.00, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400' },
  { id: 'p3', name: 'Cupcake', description: 'Cupcake esponjoso con crema.', price: 12.00, category: 'Postres', image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=400' },
  { id: 'bb1', name: 'Papilla', description: 'Papilla nutritiva para bebés.', price: 9.00, category: 'Bebés', image: 'https://images.unsplash.com/photo-1614345564887-73b318c48002?auto=format&fit=crop&q=80&w=400', options: ['Uva', 'Vainilla'] },
  { id: 'bb2', name: 'Biberón', description: 'Biberón preparado al instante.', price: 10.00, category: 'Bebés', image: 'https://images.unsplash.com/photo-1620803524670-89622d0d599c?auto=format&fit=crop&q=80&w=400', options: ['Agua', 'Leche'] }
];

const CATEGORIES = Array.from(new Set(MENU_ITEMS.map(i => i.category)));

// --- SERVICE ---
const STORAGE_KEY = 'pd_orders_v1';
const SYNC_CHANNEL = new BroadcastChannel('pd_realtime_sync');

const getStoredOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStoredOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  SYNC_CHANNEL.postMessage({ type: 'REFRESH' });
};

// --- COMPONENTS ---

const Navbar = () => {
  const loc = useLocation();
  const links = [
    { path: '/', label: 'MENÚ', icon: '🍴' },
    { path: '/cocina', label: 'COCINA', icon: '👨‍🍳' },
    { path: '/pantalla', label: 'PANTALLA', icon: '📺' }
  ];

  return (
    <nav className="bg-white border-b border-slate-100 h-20 sticky top-0 z-50 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-red-100">Iv</div>
        <div className="flex flex-col leading-none">
          <span className="font-black text-lg tracking-tighter">PEQUEÑAS DELICIAS</span>
          <span className="font-brand text-red-600 text-xs italic font-bold">de Ivanna</span>
        </div>
      </div>
      <div className="flex gap-2">
        {links.map(l => (
          <Link 
            key={l.path} 
            to={l.path} 
            className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-2 ${loc.pathname === l.path ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-400 hover:text-red-600'}`}
          >
            <span>{l.icon}</span>
            <span className="hidden md:inline">{l.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const CustomerMenu = () => {
  const [cat, setCat] = useState('Comidas');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [confirmed, setConfirmed] = useState<Order | null>(null);
  const [optionModal, setOptionModal] = useState<MenuItem | null>(null);

  const filtered = MENU_ITEMS.filter(i => i.category === cat);
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

  const add = (item: MenuItem, opt?: string) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id && i.selectedOption === opt);
      if (exists) return prev.map(i => (i.id === item.id && i.selectedOption === opt) ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1, selectedOption: opt }];
    });
    setOptionModal(null);
  };

  const placeOrder = () => {
    if (!name.trim() || cart.length === 0) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: (Math.floor(Math.random() * 899) + 100).toString(),
      items: cart,
      total,
      status: 'pending',
      createdAt: Date.now(),
      customerName: name
    };
    const orders = getStoredOrders();
    saveStoredOrders([...orders, newOrder]);
    setConfirmed(newOrder);
    setCart([]);
    setName('');
    setTimeout(() => setConfirmed(null), 7000);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
      {/* Sidebar Categorias */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 flex md:flex-col gap-2 overflow-x-auto hide-scrollbar">
        <div className="hidden md:block mb-6 px-2">
           <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Categorías</p>
           <div className="h-1 w-8 bg-red-600 rounded-full"></div>
        </div>
        {CATEGORIES.map(c => (
          <button 
            key={c} 
            onClick={() => setCat(c)}
            className={`px-6 py-4 rounded-2xl text-sm font-black text-left transition-all shrink-0 ${cat === c ? 'bg-red-600 text-white shadow-xl shadow-red-100 scale-[1.02]' : 'text-slate-400 hover:bg-white hover:text-red-600'}`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white">
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none">LA CARTA</h1>
          <p className="font-brand text-red-600 text-2xl md:text-3xl mt-2 italic">de Ivanna</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-40">
          {filtered.map(item => (
            <div key={item.id} className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-red-50 transition-all duration-500">
              <div className="h-56 overflow-hidden relative">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full font-black text-red-600 shadow-xl border border-red-50 text-xl">S/ {item.price.toFixed(2)}</div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-red-600 transition-colors uppercase">{item.name}</h3>
                <p className="text-slate-400 text-sm mb-8 line-clamp-2 italic leading-relaxed">"{item.description}"</p>
                <button 
                  onClick={() => item.options ? setOptionModal(item) : add(item)}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase hover:bg-red-600 transition-all shadow-lg active:scale-95"
                >
                  Agregar Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Cart y Form */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:relative md:w-[450px] bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-8 flex flex-col shadow-2xl z-50 animate-slide-up">
          <h2 className="text-3xl font-black mb-8 flex justify-between items-end">
            TU PEDIDO 
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-lg">{cart.length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-5 mb-8 max-h-[30vh] md:max-h-full pr-2 hide-scrollbar">
            {cart.map((i, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group animate-slide-up">
                <div>
                  <div className="font-black text-base uppercase tracking-tight">{i.name}</div>
                  {i.selectedOption && <div className="text-red-600 text-[10px] font-black uppercase tracking-widest mt-1">Sabor: {i.selectedOption}</div>}
                  <div className="text-slate-400 text-xs mt-1 font-bold">S/ {i.price.toFixed(2)} x {i.quantity}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-lg">S/ {(i.price * i.quantity).toFixed(2)}</span>
                  <button onClick={() => setCart(prev => prev.filter((_, index) => index !== idx))} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center font-bold">✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-5 border-t border-slate-200 pt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">Total a Pagar</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">S/ {total.toFixed(2)}</span>
            </div>
            <input 
              type="text" 
              placeholder="¿TU NOMBRE?" 
              className="w-full p-6 rounded-3xl bg-white border-2 border-slate-100 font-black text-center text-xl focus:border-red-600 outline-none uppercase tracking-tighter shadow-inner"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
            />
            <button 
              onClick={placeOrder}
              disabled={!name.trim()}
              className="w-full bg-red-600 text-white py-8 rounded-3xl font-black text-2xl shadow-xl shadow-red-200 disabled:opacity-20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-tighter"
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Opciones */}
      {optionModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[4rem] w-full max-w-sm text-center shadow-3xl border-[12px] border-red-50">
            <div className="text-8xl mb-8">✨</div>
            <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">Personaliza</h2>
            <p className="text-slate-400 font-bold mb-10 uppercase text-[10px] tracking-[0.4em]">¿Qué prefieres para tu {optionModal.name}?</p>
            <div className="grid gap-4">
              {optionModal.options?.map(o => (
                <button key={o} onClick={() => add(optionModal, o)} className="bg-slate-50 p-8 rounded-3xl font-black text-2xl hover:bg-red-600 hover:text-white transition-all border-2 border-slate-100 hover:border-red-600 group">
                   <span className="uppercase tracking-tighter">{o}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setOptionModal(null)} className="mt-10 text-slate-300 font-black text-[10px] uppercase tracking-[0.6em] hover:text-red-600 transition-colors">Volver</button>
          </div>
        </div>
      )}

      {/* Confirmación Flotante */}
      {confirmed && (
        <div className="fixed inset-0 bg-white/98 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center text-center p-10 animate-slide-up">
           <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center text-6xl shadow-2xl mb-12 animate-bounce">✓</div>
           <h2 className="text-7xl font-black tracking-tighter mb-4 text-slate-900 uppercase">¡ORDEN RECIBIDA!</h2>
           <p className="text-2xl font-bold text-slate-400 mb-2 uppercase tracking-wide">Gracias por elegir</p>
           <div className="flex flex-col items-center mb-16">
              <span className="text-4xl font-black text-slate-900">PEQUEÑAS DELICIAS</span>
              <span className="font-brand text-red-600 text-3xl italic">de Ivanna</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-slate-400 font-black text-xs uppercase tracking-[0.6em] mb-4">Tu número es</span>
             <div className="bg-red-600 text-white text-[10rem] font-black px-16 py-8 rounded-[4rem] shadow-3xl shadow-red-200 leading-none tracking-tighter">#{confirmed.orderNumber}</div>
           </div>
           <p className="mt-12 text-slate-300 font-black uppercase tracking-[0.3em]">Llamaremos tu número en la pantalla</p>
        </div>
      )}
    </div>
  );
};

const KitchenDisplay = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = () => setOrders(getStoredOrders().filter(o => o.status !== 'delivered'));

  useEffect(() => {
    load();
    SYNC_CHANNEL.onmessage = () => load();
    const inv = setInterval(load, 3000);
    return () => { SYNC_CHANNEL.onmessage = null; clearInterval(inv); };
  }, []);

  const update = (id: string, s: OrderStatus) => {
    const all = getStoredOrders().map(o => o.id === id ? { ...o, status: s } : o);
    saveStoredOrders(all);
    setOrders(all.filter(o => o.status !== 'delivered'));
  };

  const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing');

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-900 p-8">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <div className="bg-red-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-2xl shadow-xl shadow-red-900/40">Iv</div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 uppercase tracking-tighter">
            <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></span>
            Panel de Cocina
          </h1>
        </div>
        <div className="bg-slate-800 border border-slate-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-4">
          <span className="text-slate-500">Pendientes</span>
          <span className="text-2xl text-red-500">{pending.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pending.map(o => (
          <div key={o.id} className="bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-hidden flex flex-col shadow-3xl animate-slide-up">
            <div className={`p-8 ${o.status === 'preparing' ? 'bg-orange-500' : 'bg-red-600'} text-white flex justify-between items-start shadow-inner`}>
               <div>
                  <div className="text-5xl font-black leading-none tracking-tighter">#{o.orderNumber}</div>
                  <div className="text-xs font-bold uppercase opacity-80 mt-2 tracking-widest">{o.customerName}</div>
               </div>
               <div className="text-[10px] font-black bg-black/30 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                 {Math.floor((Date.now() - o.createdAt) / 60000)} MIN
               </div>
            </div>
            <div className="p-8 flex-1 space-y-4">
              {o.items.map((i, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-slate-900/40 p-3 rounded-2xl border border-slate-700/50">
                   <div className="w-8 h-8 bg-slate-700 text-white font-black text-xs flex items-center justify-center rounded-xl shrink-0 border border-slate-600">{i.quantity}</div>
                   <div>
                     <div className="text-white font-black text-base uppercase tracking-tight leading-tight">{i.name}</div>
                     {i.selectedOption && <div className="text-orange-400 text-[10px] font-black uppercase mt-1">Sabor: {i.selectedOption}</div>}
                   </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-900/50 border-t border-slate-700">
               {o.status === 'pending' ? (
                 <button onClick={() => update(o.id, 'preparing')} className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black hover:bg-orange-400 hover:text-white transition-all uppercase text-sm tracking-widest shadow-xl">Comenzar</button>
               ) : (
                 <button onClick={() => update(o.id, 'ready')} className="w-full bg-green-500 text-white py-5 rounded-2xl font-black hover:bg-green-600 transition-all uppercase text-sm tracking-widest shadow-xl">¡Terminado!</button>
               )}
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <div className="col-span-full h-80 flex flex-col items-center justify-center text-slate-700 border-4 border-dashed border-slate-800 rounded-[4rem] opacity-40">
            <span className="text-8xl mb-4">✨</span>
            <p className="font-black text-2xl uppercase tracking-widest">Sin pedidos pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderStatusBoard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const load = () => setOrders(getStoredOrders());

  useEffect(() => {
    load();
    SYNC_CHANNEL.onmessage = () => load();
    const inv = setInterval(load, 3000);
    return () => { SYNC_CHANNEL.onmessage = null; clearInterval(inv); };
  }, []);

  const ready = orders.filter(o => o.status === 'ready');
  const preparing = orders.filter(o => o.status === 'pending' || o.status === 'preparing');

  const deliver = (id: string) => {
    const all = getStoredOrders().map(o => o.id === id ? { ...o, status: 'delivered' as OrderStatus } : o);
    saveStoredOrders(all);
    load();
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Columna Preparando */}
      <div className="flex-1 p-10 md:p-16 bg-slate-50 overflow-y-auto">
        <div className="mb-16">
          <h2 className="text-6xl md:text-8xl font-black text-slate-200 mb-2 uppercase tracking-tighter">Preparando</h2>
          <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {preparing.map(o => (
            <div key={o.id} className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-100 text-center animate-pulse shadow-sm">
              <div className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter leading-none">#{o.orderNumber}</div>
              <div className="text-[12px] font-black text-slate-300 uppercase mt-4 tracking-[0.4em]">{o.customerName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Listos */}
      <div className="flex-1 p-10 md:p-16 bg-red-600 overflow-y-auto relative">
        <div className="absolute top-10 right-10 flex flex-col items-end opacity-20 text-white text-right">
          <span className="font-black text-2xl">PEQUEÑAS DELICIAS</span>
          <span className="font-brand text-xl italic">de Ivanna</span>
        </div>
        
        <div className="mb-16">
          <h2 className="text-6xl md:text-8xl font-black text-white/30 mb-2 uppercase tracking-tighter">Listos</h2>
          <div className="h-2 w-24 bg-white/30 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          {ready.map(o => (
            <div 
              key={o.id} 
              onClick={() => deliver(o.id)}
              className="bg-white p-12 rounded-[4rem] text-center shadow-[0_40px_100px_rgba(0,0,0,0.2)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer border-[8px] border-white group relative overflow-hidden"
            >
              <div className="text-8xl md:text-[10rem] font-black text-red-600 leading-none tracking-tighter">#{o.orderNumber}</div>
              <div className="text-2xl font-black text-slate-900 uppercase mt-6 tracking-tight">{o.customerName}</div>
              
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-white border-8 border-white">
                <span className="text-4xl font-black uppercase tracking-tighter mb-2">¡Recoger!</span>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Confirmar entrega</span>
              </div>
            </div>
          ))}
          {ready.length === 0 && (
            <div className="col-span-full h-80 flex flex-col items-center justify-center text-white/10">
               <span className="text-[12rem] leading-none mb-4">🍽️</span>
               <p className="font-black text-3xl uppercase tracking-tighter">Esperando pedidos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- APP SETUP ---

const App = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<CustomerMenu />} />
            <Route path="/cocina" element={<KitchenDisplay />} />
            <Route path="/pantalla" element={<OrderStatusBoard />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
