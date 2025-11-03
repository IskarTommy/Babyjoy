import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
      <div className="flex items-center justify-center gap-2">
        <span>You are currently offline. Some features may not work properly.</span>
        {isOnline && (
          <Button
            size="sm"
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-red-500"
            onClick={() => setShowOfflineMessage(false)}
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};