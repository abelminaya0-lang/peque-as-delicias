
import { Order } from '../types.ts';

const STORAGE_KEY = 'quickorder_orders_v2';
const CHANNEL_NAME = 'pequenas_delicias_sync';

class OrderService {
  private channel: BroadcastChannel;
  private listeners: ((orders: Order[]) => void)[] = [];

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    
    // Escuchar mensajes de otras pestañas
    this.channel.onmessage = (event) => {
      if (event.data.type === 'UPDATE_ORDERS') {
        this.notifyListeners(event.data.payload);
      }
    };

    // Escuchar cambios en localStorage (respaldo de seguridad)
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        const orders = this.getOrders();
        this.notifyListeners(orders);
      }
    });
  }

  getOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveOrders(orders: Order[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    // Notificar inmediatamente a otras pestañas
    this.channel.postMessage({ type: 'UPDATE_ORDERS', payload: orders });
    // Notificar a la pestaña actual
    this.notifyListeners(orders);
  }

  addOrder(order: Order) {
    const orders = this.getOrders();
    const newOrders = [...orders, order];
    this.saveOrders(newOrders);
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const orders = this.getOrders();
    const newOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    this.saveOrders(newOrders);
  }

  private notifyListeners(orders: Order[]) {
    this.listeners.forEach(callback => callback(orders));
  }

  onUpdate(callback: (orders: Order[]) => void) {
    this.listeners.push(callback);
    // Ejecutar callback inicial
    callback(this.getOrders());
  }
}

export const orderService = new OrderService();
