
import React, { useEffect, useState } from 'react';
import API from '@/services/api.js';
import KDSOrderCard from '@/components/KDSOrderCard.jsx'; // A new component for displaying orders
import styles from './KDS.module.css';

export default function KDS() {
  // State to hold active orders, not just raw messages
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Establish WebSocket connection
    const wsUrl = (import.meta.env.VITE_API_WS || 'ws://localhost:4000') + '/kds';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('KDS WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // The backend should send a `type` field to distinguish messages
      switch (message.type) {
        case 'NEW_ORDER':
          // Add new orders to the top of the list
          setOrders(prevOrders => [message.payload, ...prevOrders]);
          break;
        case 'ORDER_CANCELLED':
          // Remove cancelled orders from the display
          setOrders(prevOrders => prevOrders.filter(order => order.id !== message.payload.orderId));
          break;
        // Add more cases here for other real-time events if needed
        default:
          console.log('Received unhandled message type:', message.type);
      }
    };

    ws.onclose = () => {
      console.log('KDS WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('KDS WebSocket error:', error);
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
      ws.close();
    };
  }, []); // Empty dependency array ensures this runs only once

  // Function to handle updating an item's status (e.g., to 'PREPARING' or 'READY')
  const handleItemStatusUpdate = async (itemId, newStatus) => {
    try {
      // This endpoint needs to be created in your backend
      await API.patch(`/order-items/${itemId}/status`, { status: newStatus });
      // The backend should then broadcast this update via WebSocket to all KDS clients
      // For now, we can optimistically update the UI
      setOrders(prevOrders => prevOrders.map(order => ({
        ...order,
        items: order.items.map(item => item.id === itemId ? { ...item, status: newStatus } : item)
      })));
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  };

  return (
    <div className={styles.kdsContainer}>
      <h1 className={styles.header}>Kitchen Display System</h1>
      <div className={styles.ordersGrid}>
        {orders.length > 0 ? (
          orders.map(order => (
            <KDSOrderCard
              key={order.id}
              order={order}
              onItemStatusUpdate={handleItemStatusUpdate}
            />
          ))
        ) : (
          <p className={styles.noOrdersMessage}>No active orders.</p>
        )}
      </div>
    </div>
  );
}
