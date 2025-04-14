import React from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Notification, useNotifications } from '@/contexts/NotificationContext';

interface NotificationToastProps {
  notification: Notification;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const { removeNotification } = useNotifications();

  const handleClose = () => {
    removeNotification(notification.id);
  };

  // Icon basierend auf dem Typ der Benachrichtigung
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  // Hintergrundfarbe basierend auf dem Typ der Benachrichtigung
  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  // Textfarbe basierend auf dem Typ der Benachrichtigung
  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  // Zeitunterschied zwischen jetzt und dem Erstellungszeitpunkt
  const getTimeAgo = () => {
    const now = new Date();
    const createdAt = notification.createdAt;
    const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Gerade eben';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Vor ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Vor ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
    }
  };

  return (
    <div className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden ${getBackgroundColor()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${getTextColor()}`}>{notification.title}</p>
            <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>{notification.message}</p>
            <p className="mt-1 text-xs text-gray-500">{getTimeAgo()}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className={`inline-flex rounded-md ${getTextColor()} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={handleClose}
            >
              <span className="sr-only">Schließen</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
