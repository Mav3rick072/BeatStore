export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen: string;
}

export const productosMock: Producto[] = [
  { 
    id: 1, 
    nombre: 'Vinilo Edición Especial - Rock Clásico', 
    categoria: 'Vinilos', 
    precio: 550.00, 
    stock: 15,
    imagen: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=300&auto=format&fit=crop&q=80'
  },
  { 
    id: 2, 
    nombre: 'Audífonos de Monitoreo Studio Pro', 
    categoria: 'Accesorios', 
    precio: 1200.00, 
    stock: 8,
    imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80'
  },
  { 
    id: 3, 
    nombre: 'CD Álbum Pop Tour 2026', 
    categoria: 'CDs', 
    precio: 250.00, 
    stock: 30,
    imagen: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'
  },
  { 
    id: 4, 
    nombre: 'Micrófono Condensador USB Podcast', 
    categoria: 'Equipo', 
    precio: 1850.00, 
    stock: 5,
    imagen: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80'
  },
];