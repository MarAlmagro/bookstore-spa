export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}
