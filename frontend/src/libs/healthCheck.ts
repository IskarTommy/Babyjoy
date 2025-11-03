// Health check utility to test backend connectivity
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/products/', {
      method: 'HEAD', // Just check if endpoint is reachable
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

export const getConnectionStatus = async (): Promise<{
  isOnline: boolean;
  backendReachable: boolean;
  latency?: number;
}> => {
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    return { isOnline: false, backendReachable: false };
  }

  const startTime = Date.now();
  const backendReachable = await checkBackendHealth();
  const latency = Date.now() - startTime;

  return {
    isOnline,
    backendReachable,
    latency: backendReachable ? latency : undefined,
  };
};