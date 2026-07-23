export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
}

export const productosMock: Producto[] = [
  { id: 1, nombre: 'Vinilo Edición Especial - Rock Clásico', categoria: 'Vinilos', precio: 550.00, stock: 15 },
  { id: 2, nombre: 'Audífonos de Monitoreo Studio Pro', categoria: 'Accesorios', precio: 1200.00, stock: 8 },
  { id: 3, nombre: 'CD Álbum Pop Tour 2026', categoria: 'CDs', precio: 250.00, stock: 30 },
  { id: 4, nombre: 'Micrófono Condensador USB Podcast', categoria: 'Equipo', precio: 1850.00, stock: 5 },
];