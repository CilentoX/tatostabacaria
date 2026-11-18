const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('tatos_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('tatos_token', token);
    } else {
      localStorage.removeItem('tatos_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Don't set Content-Type for FormData (multipart)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/admin/login';
      throw new Error('Sessão expirada');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async logout() {
    this.setToken(null);
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/products');
  }

  async getAllProducts(params?: { cursor?: string; limit?: number; search?: string }): Promise<PaginatedResponse<Product>> {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set('cursor', params.cursor);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return this.request<PaginatedResponse<Product>>(`/api/products/all${q ? '?' + q : ''}`);
  }

  async createProduct(data: FormData): Promise<Product> {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: data,
    });
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderProducts(order: number[]): Promise<void> {
    return this.request<void>('/api/products/reorder', {
      method: 'PUT',
      body: JSON.stringify({ order }),
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async createUser(data: CreateUserInput): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.request<void>('/api/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.request<Settings>('/api/settings');
  }

  async updateSettings(data: Settings): Promise<void> {
    return this.request<void>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Customers
  async getCustomers(params?: { cursor?: string; limit?: number; search?: string }): Promise<PaginatedResponse<Customer>> {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set('cursor', params.cursor);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    const q = qs.toString();
    return this.request<PaginatedResponse<Customer>>(`/api/customers${q ? '?' + q : ''}`);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.request<void>(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales
  async getSales(params?: Record<string, string>): Promise<PaginatedResponse<Sale>> {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<PaginatedResponse<Sale>>(`/api/sales${qs}`);
  }

  async createSale(data: CreateSaleInput): Promise<Sale> {
    return this.request<Sale>('/api/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelSale(id: string): Promise<Sale> {
    return this.request<Sale>(`/api/sales/${id}/cancel`, {
      method: 'PATCH',
    });
  }

 // Categories
 async getCategories(): Promise<Category[]> {
 return this.request<Category[]>('/api/categories');
 }

  async getSaleStats(): Promise<SaleStats> {
    return this.request<SaleStats>('/api/sales/stats/summary');
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'master' | 'admin';
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  type: 'image' | 'video';
  src: string;
  sortOrder: number;
  stock?: number;
  price?: number;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'master' | 'admin';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: 'master' | 'admin';
}

export interface Settings {
  instagram_url?: string;
  [key: string]: string | undefined;
}

export interface Customer {
  id: string;
  name: string;
  instagram?: string | null;
  phone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { sales: number };
}

export interface SaleItem {
  id: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: { id: number; name: string };
}

export interface Sale {
  id: string;
  customerId?: string | null;
  customer?: { id: string; name: string; instagram?: string | null } | null;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleStats {
  totalSales: number;
  monthSales: number;
  totalRevenue: number;
  monthRevenue: number;
}

export interface CreateSaleInput {
  customerId?: string | null;
  status?: 'pending' | 'completed' | 'cancelled';
  items: { productId: number; quantity: number; unitPrice: number }[];
}


export interface Category {
 id: number;
 name: string;
 slug: string;
 sortOrder: number;
 active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export const api = new ApiClient();
export { API_URL };