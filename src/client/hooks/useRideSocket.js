import { useState, useEffect, useRef, useCallback } from 'react';

export function useRideSocket({ role = 'passenger', meta = {}, onEvent } = {}) {
  const [connected, setConnected] = useState(false);
  const [lastError, setLastError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Detectar protocolo y host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // En desarrollo con Vite en 5173, nos conectamos al puerto 3000 de backend
    const host = window.location.port === '5173'
      ? `${window.location.hostname}:3000`
      : window.location.host;

    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setLastError(null);

        // Identificar rol del cliente
        ws.send(JSON.stringify({
          event: 'client:init',
          data: { role, meta }
        }));
      };

      ws.onmessage = (message) => {
        try {
          const { event, data } = JSON.parse(message.data);
          if (onEventRef.current) {
            onEventRef.current(event, data);
          }
        } catch (err) {
          console.error('Error parseando mensaje WS:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Error de conexión WebSocket:', err);
        setLastError('Error de conexión');
      };

      ws.onclose = () => {
        setConnected(false);
        // Intentar reconectar automáticamente cada 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (err) {
      setLastError(err.message);
    }
  }, [role, meta]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const sendEvent = useCallback((event, data = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
      return true;
    }
    return false;
  }, []);

  return {
    connected,
    lastError,
    sendEvent
  };
}
