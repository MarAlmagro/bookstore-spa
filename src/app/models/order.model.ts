export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  bookId: number;
  quantity: number;
  price?: number;
  bookTitle?: string;
  bookIsbn?: string;
}

export interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  totalAmount?: number;
  status?: OrderStatus;
  createdAt?: string;
}

export interface CreateOrderRequest {
  userId: number;
  items: Pick<OrderItem, 'bookId' | 'quantity'>[];
}
