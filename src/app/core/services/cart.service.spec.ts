import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Book } from '@app/models';

describe('CartService', () => {
  let service: CartService;

  const mockBook1: Book = {
    id: 1,
    isbn: '123',
    title: 'Book 1',
    author: 'Author 1',
    price: 29.99,
    stock: 10,
    category: 'Fiction'
  };

  const mockBook2: Book = {
    id: 2,
    isbn: '456',
    title: 'Book 2',
    author: 'Author 2',
    price: 39.99,
    stock: 5,
    category: 'Tech'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService]
    });
    service = TestBed.inject(CartService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addItem', () => {
    it('should add new item to cart', (done) => {
      service.addItem(mockBook1);

      service.items$.subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].book.id).toBe(1);
        expect(items[0].quantity).toBe(1);
        done();
      });
    });

    it('should increment quantity for existing item', (done) => {
      service.addItem(mockBook1);
      service.addItem(mockBook1);

      service.items$.subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].quantity).toBe(2);
        done();
      });
    });

    it('should add multiple different items', (done) => {
      service.addItem(mockBook1);
      service.addItem(mockBook2);

      service.items$.subscribe(items => {
        expect(items.length).toBe(2);
        done();
      });
    });

    it('should persist to localStorage', () => {
      service.addItem(mockBook1);
      const stored = localStorage.getItem('bookstore_cart');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', (done) => {
      service.addItem(mockBook1);
      service.updateQuantity(1, 5);

      service.items$.subscribe(items => {
        expect(items[0].quantity).toBe(5);
        done();
      });
    });

    it('should remove item when quantity is 0', (done) => {
      service.addItem(mockBook1);
      service.updateQuantity(1, 0);

      service.items$.subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });

    it('should remove item when quantity is negative', (done) => {
      service.addItem(mockBook1);
      service.updateQuantity(1, -1);

      service.items$.subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', (done) => {
      service.addItem(mockBook1);
      service.addItem(mockBook2);
      service.removeItem(1);

      service.items$.subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].book.id).toBe(2);
        done();
      });
    });
  });

  describe('clear', () => {
    it('should remove all items from cart', (done) => {
      service.addItem(mockBook1);
      service.addItem(mockBook2);
      service.clear();

      service.items$.subscribe(items => {
        expect(items.length).toBe(0);
        done();
      });
    });

    it('should clear localStorage', () => {
      service.addItem(mockBook1);
      service.clear();
      const stored = localStorage.getItem('bookstore_cart');
      expect(stored).toBe('[]');
    });
  });

  describe('itemCount$', () => {
    it('should return total item count', (done) => {
      service.addItem(mockBook1, 2);
      service.addItem(mockBook2, 3);

      service.itemCount$.subscribe(count => {
        expect(count).toBe(5);
        done();
      });
    });
  });

  describe('total$', () => {
    it('should calculate total price', (done) => {
      service.addItem(mockBook1, 2);
      service.addItem(mockBook2, 1);

      service.total$.subscribe(total => {
        expect(total).toBe(99.97);
        done();
      });
    });
  });

  describe('getOrderItems', () => {
    it('should return order items format', () => {
      service.addItem(mockBook1, 2);
      service.addItem(mockBook2, 1);

      const orderItems = service.getOrderItems();
      expect(orderItems.length).toBe(2);
      expect(orderItems[0]).toEqual({ bookId: 1, quantity: 2 });
      expect(orderItems[1]).toEqual({ bookId: 2, quantity: 1 });
    });
  });

  describe('localStorage persistence', () => {
    it('should load cart from localStorage on init', () => {
      const cartData = [{ book: mockBook1, quantity: 2 }];
      localStorage.setItem('bookstore_cart', JSON.stringify(cartData));

      const newService = new CartService();
      newService.items$.subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].quantity).toBe(2);
      });
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('bookstore_cart', 'invalid-json');

      const newService = new CartService();
      newService.items$.subscribe(items => {
        expect(items.length).toBe(0);
      });
    });
  });
});
