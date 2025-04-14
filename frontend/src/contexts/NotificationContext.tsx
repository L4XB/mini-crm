import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxNotifications = 5 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Automatisches Schließen von Benachrichtigungen
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      if (notification.autoClose) {
        const timeout = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000); // Standarddauer: 5 Sekunden
        
        timeouts.push(timeout);
      }
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = Date.now().toString();
    
    setNotifications(prevNotifications => {
      // Wenn die maximale Anzahl erreicht ist, entferne die älteste Benachrichtigung
      if (prevNotifications.length >= maxNotifications) {
        return [
          ...prevNotifications.slice(1),
          { ...notification, id, createdAt: new Date() }
        ];
      }
      
      return [...prevNotifications, { ...notification, id, createdAt: new Date() }];
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification, 
        clearAllNotifications 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};
