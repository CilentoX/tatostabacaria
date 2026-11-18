export interface Product {
  id: number;
  name: string;
  type: 'image' | 'video';
  src: string;
}

export const products: Product[] = [
  { id: 1, name: 'Produto 1', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.49.jpeg' },
  { id: 2, name: 'Produto 2', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.49 (1).jpeg' },
  { id: 3, name: 'Produto 3', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.49 (2).jpeg' },
  { id: 4, name: 'Produto 4', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.50.jpeg' },
  { id: 5, name: 'Produto 5', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.50 (1).jpeg' },
  { id: 6, name: 'Produto 6', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.50 (2).jpeg' },
  { id: 7, name: 'Produto 7', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.50 (3).jpeg' },
  { id: 8, name: 'Produto 8', type: 'video', src: '/assets/WhatsApp Video 2026-11-13 at 20.46.52.mp4' },
  { id: 9, name: 'Produto 9', type: 'image', src: '/assets/WhatsApp Image 2026-11-13 at 20.46.53.jpeg' },
  { id: 10, name: 'Produto 10', type: 'video', src: '/assets/WhatsApp Video 2026-11-13 at 20.47.01.mp4' },
  { id: 11, name: 'Produto 11', type: 'video', src: '/assets/WhatsApp Video 2026-11-13 at 20.47.18.mp4' },
  { id: 12, name: 'Produto 12', type: 'video', src: '/assets/WhatsApp Video 2026-11-13 at 20.47.43.mp4' },
  { id: 13, name: 'Produto 13', type: 'video', src: '/assets/WhatsApp Video 2026-11-13 at 20.47.51.mp4' },
];