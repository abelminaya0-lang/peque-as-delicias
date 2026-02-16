
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  imagePrompt: string;
  options?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedOption?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  customerName: string;
}

export enum AppRoute {
  MENU = 'menu',
  KITCHEN = 'kitchen',
  STATUS = 'status'
}
