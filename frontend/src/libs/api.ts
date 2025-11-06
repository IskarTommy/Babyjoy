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

// Generic API call function with timeout and better error handling
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    signal: controller.signal,
  };
  
  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      if (error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection and try again');
      }
    }
    
    throw error;
  }
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

export const fetchUserPermissions = async () => {
  const response = await apiCall('/users/permissions/');
  if (!response.ok) throw new Error('Failed to fetch user permissions');
  return response.json();
};

export const updateUserRole = async (userId: number, role: string) => {
  const response = await apiCall('/users/update-role/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, role }),
  });
  if (!response.ok) throw new Error('Failed to update user role');
  return response.json();
};

export const toggleUserStatus = async (userId: number) => {
  const response = await apiCall('/users/toggle-status/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) throw new Error('Failed to toggle user status');
  return response.json();
};

export const resetUserPassword = async (userId: number, newPassword?: string) => {
  const response = await apiCall('/users/reset-password/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, new_password: newPassword }),
  });
  if (!response.ok) throw new Error('Failed to reset user password');
  return response.json();
};

export const updateUserProfile = async (userId: number, profileData: any) => {
  const response = await apiCall('/users/update-profile/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, ...profileData }),
  });
  if (!response.ok) throw new Error('Failed to update user profile');
  return response.json();
};