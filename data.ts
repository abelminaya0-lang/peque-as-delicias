
import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // Comidas
  {
    id: 'c1',
    name: 'Sopa',
    description: 'Sopa casera del día, caliente y nutritiva.',
    price: 6.00,
    category: 'Comidas',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'c2',
    name: 'Perro Calientes',
    description: 'Hot dog clásico con salsas y papas al hilo.',
    price: 10.00,
    category: 'Comidas',
    image: 'https://images.unsplash.com/photo-1612392061787-2d078b3e573c?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'c3',
    name: 'Pollo a la Brasa',
    description: 'Solo pollo (sin papas), marinado con nuestra receta secreta.',
    price: 11.00,
    category: 'Comidas',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'c4',
    name: 'Huevos con Hot Dog',
    description: 'Huevos revueltos acompañados de trozos de hot dog.',
    price: 4.00,
    category: 'Comidas',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'c5',
    name: 'Pizza',
    description: 'Pizza artesanal con queso fundido y orégano.',
    price: 7.00,
    category: 'Comidas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'c6',
    name: 'Choclo con Lechuga',
    description: 'Choclo tierno desgranado sobre cama de lechuga fresca.',
    price: 5.00,
    category: 'Comidas',
    image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },

  // Bebidas
  {
    id: 'b1',
    name: 'Gaseosa',
    description: 'Bebida refrescante de 500ml.',
    price: 10.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'b2',
    name: 'Jugo de Naranja',
    description: 'Jugo 100% natural recién exprimido.',
    price: 19.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1600271886399-0d2e824d5e1e?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'b3',
    name: 'Hiervas',
    description: 'Infusión de hierbas naturales calientes.',
    price: 12.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc45865157?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'b4',
    name: 'Agua Mineral',
    description: 'Agua purificada sin gas.',
    price: 4.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'b5',
    name: 'Limonada',
    description: 'Limonada casera con harto hielo.',
    price: 11.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'b6',
    name: 'Chicha',
    description: 'Tradicional chicha morada artesanal.',
    price: 9.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },

  // Postres
  {
    id: 'p1',
    name: 'Plátanos',
    description: 'Plátanos frescos o fritos según disponibilidad.',
    price: 4.00,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'p2',
    name: 'Manzana',
    description: 'Manzana seleccionada, crujiente y dulce.',
    price: 2.00,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'p3',
    name: 'Capquey',
    description: 'Cupcake esponjoso con crema arriba.',
    price: 12.00,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'p4',
    name: 'Helado',
    description: 'Tres bolas de helado de sabores variados.',
    price: 18.00,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },
  {
    id: 'p5',
    name: 'Paleta',
    description: 'Paleta de agua o crema súper refrescante.',
    price: 20.00,
    category: 'Postres',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=800',
    imagePrompt: ''
  },

  // Bebés
  {
    id: 'bb1',
    name: 'Papilla',
    description: 'Papilla nutritiva.',
    price: 9.00,
    category: 'Bebés',
    image: 'https://images.unsplash.com/photo-1614345564887-73b318c48002?auto=format&fit=crop&q=80&w=800',
    imagePrompt: '',
    options: ['Uva', 'Vainilla']
  },
  {
    id: 'bb2',
    name: 'Biberón',
    description: 'Biberón para el pequeño.',
    price: 10.00,
    category: 'Bebés',
    image: 'https://images.unsplash.com/photo-1620803524670-89622d0d599c?auto=format&fit=crop&q=80&w=800',
    imagePrompt: '',
    options: ['Agua', 'Leche']
  }
];

export const CATEGORIES = Array.from(new Set(MENU_ITEMS.map(i => i.category)));
