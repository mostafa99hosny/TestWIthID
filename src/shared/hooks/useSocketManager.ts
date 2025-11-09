import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useProgress } from '../context/ProgressContext';

export const useSocketManager = () => {
  const { socket } = useSocket();
  const { dispatch, progressStates } = useProgress();

  useEffect(() => {
    if (!socket) {
      console.log('[SOCKET MANAGER] ❌ No socket available');
      return;
    }

    console.log('[SOCKET MANAGER] ✅ Setting up socket listeners, socket ID:', socket.id);

    // Enhanced logging for ALL events
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      console.log(`🎯 [SOCKET MANAGER] ALL EVENTS - ${eventName}:`, args);
    };

    socket.onAny(handleAnyEvent);

    const handleProgress = (data: any) => {
      console.log('[SOCKET MANAGER] 🔥 macro_edit_progress received:', data);

      const reportId = data.reportId;
      if (!reportId) {
        console.error('[SOCKET MANAGER] ❌ No reportId found in progress data');
        return;
      }

      console.log('[SOCKET MANAGER] 🚀 Dispatching progress update for report:', reportId);

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: data.status === 'COMPLETED' ? 'COMPLETE' : data.status,
            message: data.message || 'Processing...',
            progress: data.data?.percentage || 0,
            data: data.data
          }
        }
      });
    };

    const handleComplete = (data: any) => {
      console.log('[SOCKET MANAGER] ✅ macro_edit_complete received:', data);

      if (data.reportId) {
        console.log('[SOCKET MANAGER] 🚀 Dispatching completion for report:', data.reportId);

        dispatch({
          type: 'UPDATE_PROGRESS',
          payload: {
            reportId: data.reportId,
            updates: {
              status: 'COMPLETE',
              message: data.message || 'Completed!',
              progress: 100,
              data: data.data
            }
          }
        });
      }
    };

    const handleError = (data: any) => {
      console.log('[SOCKET MANAGER] ❌ macro_edit_error received:', data);

      if (data.reportId) {
        console.log('[SOCKET MANAGER] 🚀 Dispatching error for report:', data.reportId);

        dispatch({
          type: 'UPDATE_PROGRESS',
          payload: {
            reportId: data.reportId,
            updates: {
              status: 'FAILED',
              message: data.error || 'An error occurred',
              progress: 0,
              data: data.data
            }
          }
        });
      }
    };

    // Listen to the actual events being emitted
    socket.on('macro_edit_progress', handleProgress);
    socket.on('macro_edit_complete', handleComplete);
    socket.on('macro_edit_error', handleError);

    console.log('[SOCKET MANAGER] ✅ Event listeners registered');

    return () => {
      console.log('[SOCKET MANAGER] 🧹 Cleaning up socket listeners');
      socket.off('macro_edit_progress', handleProgress);
      socket.off('macro_edit_complete', handleComplete);
      socket.off('macro_edit_error', handleError);
      socket.offAny(handleAnyEvent);
    };
  }, [socket, dispatch]);
};