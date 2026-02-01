export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh'
  },
  BOOKS: {
    LIST: '/books',
    PAGINATED: '/books/page',
    BY_ID: (id: number) => `/books/${id}`,
    BY_ISBN: (isbn: string) => `/books/isbn/${isbn}`,
    SEARCH: '/books/search',
    BY_CATEGORY: (category: string) => `/books/category/${category}`,
    BY_CATEGORY_PAGINATED: (category: string) => `/books/category/${category}/page`,
    SEARCH_PAGINATED: '/books/search/page',
    AVAILABLE: '/books/available'
  },
  ORDERS: {
    CREATE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    BY_USER: (userId: number) => `/orders/user/${userId}`,
    BY_USER_PAGINATED: (userId: number) => `/orders/user/${userId}/page`
  },
  USERS: {
    PROFILE: '/users/profile'
  }
} as const;
