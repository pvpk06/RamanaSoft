import React, { useEffect} from 'react';
import './notification.css';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>&times;</button>
      <div className="notification-line"></div>
    </div>
  );
};

export default Notification;
