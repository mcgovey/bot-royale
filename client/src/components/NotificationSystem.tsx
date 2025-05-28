import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../store/gameStore';

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-cyber-green/20 border-cyber-green text-cyber-green';
      case 'error':
        return 'bg-cyber-red/20 border-cyber-red text-cyber-red';
      case 'warning':
        return 'bg-cyber-orange/20 border-cyber-orange text-cyber-orange';
      case 'info':
      default:
        return 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              panel-cyber p-4 min-w-80 max-w-96 cursor-pointer
              ${getNotificationStyles(notification.type)}
            `}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-xl font-bold">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-xs opacity-90">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
