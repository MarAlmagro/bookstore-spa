import { Page } from '@playwright/test';

export const mockBooks = [
  {
    id: 1,
    isbn: '9780134685991',
    title: 'Effective Java',
    author: 'Joshua Bloch',
    description: 'The definitive guide to Java best practices',
    price: 45.99,
    stock: 50,
    category: 'Programming'
  },
  {
    id: 2,
    isbn: '9780596517748',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    description: 'Unearthing the excellence in JavaScript',
    price: 29.99,
    stock: 30,
    category: 'Programming'
  }
];

export const mockAuthResponse = {
  token: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: {
    id: 1,
    email: 'customer@example.com',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'CUSTOMER'
  }
};

export async function setupApiMocks(page: Page) {
  await page.route('**/api/v1/books/page**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: mockBooks,
        page: 0,
        size: 20,
        totalElements: mockBooks.length,
        totalPages: 1,
        first: true,
        last: true
      })
    });
  });

  await page.route('**/api/v1/books', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBooks)
      });
    }
  });

  await page.route('**/api/v1/books/*', async (route) => {
    const url = route.request().url();
    const regex = /\/books\/(\d+)/;
    const idMatch = regex.exec(url);
    if (idMatch) {
      const id = Number.parseInt(idMatch[1], 10);
      const book = mockBooks.find(b => b.id === id) || mockBooks[0];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(book)
      });
    }
  });

  await page.route('**/api/v1/auth/login', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.email === 'customer@example.com' && body?.password === 'customer123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAuthResponse)
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' })
      });
    }
  });

  await page.route('**/api/v1/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAuthResponse)
    });
  });

  await page.route('**/api/v1/orders', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-order-' + Date.now(),
          userId: 1,
          items: [],
          totalAmount: 75.98,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        })
      });
    }
  });

  await page.route('**/api/v1/orders/user/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });
}
