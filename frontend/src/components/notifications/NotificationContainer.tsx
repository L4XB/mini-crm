import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationToast from './NotificationToast';

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div 
      aria-live="assertive" 
      className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 z-50"
    >
      <div className="flex flex-col items-center space-y-4 w-full sm:items-end">
        {notifications.map((notification) => (
          <NotificationToast 
            key={notification.id} 
            notification={notification} 
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
