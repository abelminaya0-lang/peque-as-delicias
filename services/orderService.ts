
import { Order } from '../types.ts';

const STORAGE_KEY = 'quickorder_orders';
const CHANNEL_NAME = 'quickorder_sync';

class OrderService {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
  }

  getOrders(): Order[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveOrders(orders: Order[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    this.channel.postMessage({ type: 'UPDATE_ORDERS', payload: orders });
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

  onUpdate(callback: (orders: Order[]) => void) {
    this.channel.onmessage = (event) => {
      if (event.data.type === 'UPDATE_ORDERS') {
        callback(event.data.payload);
      }
    };
  }
}

export const orderService = new OrderService();
