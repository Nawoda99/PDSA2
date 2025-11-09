import React, { createContext, useContext, useState, useCallback } from 'react';
import MessagePop from '../components/messagebox/MessagePop';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(
    (message, type = 'info', duration = 3000, onComplete = () => {}) => {
      setNotification({ message, type, duration, onComplete });
    },
    []
  );

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <MessagePop
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={closeNotification}
          onComplete={() => {
            notification.onComplete();
            closeNotification();
          }}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
