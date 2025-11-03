// API utility functions with authentication

const API_BASE_URL = '/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Create authenticated headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
};

// Generic API call function
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  
  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
};

// Specific API functions
export const fetchProducts = async () => {
  const response = await apiCall('/products/');
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const fetchSales = async () => {
  const response = await apiCall('/sales/');
  if (!response.ok) throw new Error('Failed to fetch sales');
  return response.json();
};

export const createSale = async (saleData: any) => {
  const response = await apiCall('/sales/', {
    method: 'POST',
    body: JSON.stringify(saleData),
  });
  if (!response.ok) throw new Error('Failed to create sale');
  return response.json();
};

export const createProduct = async (productData: any) => {
  const response = await apiCall('/products/', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

export const updateProduct = async (id: number, productData: any) => {
  const response = await apiCall(`/products/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProduct = async (id: number) => {
  const response = await apiCall(`/products/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.ok;
};
export const fetchAnalytics = async () => {
  const response = await apiCall('/analytics/');
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

export const fetchUsers = async () => {
  const response = await apiCall('/users/');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};