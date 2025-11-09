import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Generate or retrieve a persistent user session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('browserSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('browserSessionId', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 10000
    });

    const socket = socketRef.current;
    const sessionId = getSessionId();

    socket.on('connect', () => {
      console.log('[SOCKET CONTEXT] Connected:', socket.id);
      setIsConnected(true);

      // Identify this connection with the persistent session ID
      socket.emit('user_identified', sessionId);
    });

    socket.on('MACRO_EDIT', (data) => {
      console.log('[SOCKET CONTEXT] MACRO_EDIT event received:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET CONTEXT] Disconnected. Reason:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[SOCKET CONTEXT] Connection error:', error);
      setIsConnected(false);
    });

    // Enhanced reconnection monitoring
    socket.io.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[SOCKET CONTEXT] Reconnection attempt ${attemptNumber}`);
    });

    socket.io.on('reconnect', (attemptNumber) => {
      console.log(`[SOCKET CONTEXT] Successfully reconnected after ${attemptNumber} attempts`);
      // Re-identify after reconnection
      socket.emit('user_identified', sessionId);
    });

    socket.io.on('reconnect_error', (error) => {
      console.error('[SOCKET CONTEXT] Reconnection error:', error);
    });

    socket.io.on('reconnect_failed', () => {
      console.log('[SOCKET CONTEXT] All reconnection attempts failed');
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect');
      socket.io.off('reconnect_error');
      socket.io.off('reconnect_failed');
      socket.disconnect();
    };
  }, [SOCKET_URL]);

  const value = {
    socket: socketRef.current,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};