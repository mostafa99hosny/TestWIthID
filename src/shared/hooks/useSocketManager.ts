import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useProgress } from '../context/ProgressContext';

export const useSocketManager = () => {
  const { socket } = useSocket();
  const { dispatch } = useProgress();

  useEffect(() => {
    if (!socket) {
      console.log('[SOCKET MANAGER] ❌ No socket available');
      return;
    }

    console.log('[SOCKET MANAGER] ✅ Setting up socket listeners, socket ID:', socket.id);

    // Enhanced logging for ALL events (debugging)
    const handleAnyEvent = (eventName: string, ...args: any[]) => {
      console.log(`🎯 [SOCKET MANAGER] EVENT: ${eventName}`, args);
    };
    socket.onAny(handleAnyEvent);

    // ========================================
    // MACRO EDIT PROGRESS EVENTS (from backend)
    // ========================================

    const handleMacroEditProgress = (data: any) => {
      console.log('[SOCKET MANAGER] 📊 macro_edit_progress received:', data);

      const reportId = data.reportId;
      if (!reportId) {
        console.error('[SOCKET MANAGER] ❌ No reportId in progress data');
        return;
      }

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: data.status || 'PROCESSING',
            message: data.message || 'Processing...',
            progress: data.data?.percentage || 0,
            paused: false,
            stopped: false,
            data: {
              current: data.data?.current || 0,
              total: data.data?.total || 0,
              macro_id: data.data?.macro_id,
              failedRecords: data.data?.failed_records || 0,
              numTabs: data.data?.numTabs || 1,
              error: data.data?.error
            }
          }
        }
      });
    };

    const handleMacroEditComplete = (data: any) => {
      console.log('[SOCKET MANAGER] ✅ macro_edit_complete received:', data);

      const reportId = data.reportId;
      if (!reportId) {
        console.error('[SOCKET MANAGER] ❌ No reportId in completion data');
        return;
      }

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: 'COMPLETE',
            message: data.message || 'Completed successfully!',
            progress: 100,
            paused: false,
            stopped: false,
            data: {
              current: data.data?.current || data.data?.total || 0,
              total: data.data?.total || 0,
              failedRecords: data.data?.failedRecords || 0,
              numTabs: data.data?.numTabs || 1,
              percentage: 100
            }
          }
        }
      });
    };

    const handleMacroEditError = (data: any) => {
      console.log('[SOCKET MANAGER] ❌ macro_edit_error received:', data);

      const reportId = data.reportId;
      if (!reportId) {
        console.error('[SOCKET MANAGER] ❌ No reportId in error data');
        return;
      }

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: 'FAILED',
            message: data.error || data.message || 'An error occurred',
            progress: 0,
            paused: false,
            stopped: false,
            data: {
              error: data.error,
              macro_id: data.data?.macro_id
            }
          }
        }
      });
    };

    // ========================================
    // BATCH PROCESSING EVENTS (from backend)
    // ========================================

    const handleProcessingProgress = (data: any) => {
      console.log('[SOCKET MANAGER] 📊 processing_progress received:', data);

      const reportId = data.reportId || data.batchId;
      if (!reportId) {
        console.error('[SOCKET MANAGER] ❌ No reportId/batchId in processing data');
        return;
      }

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: data.status || 'PROCESSING',
            message: data.message || 'Processing...',
            progress: data.percentage || 0,
            data: data
          }
        }
      });
    };

    const handleProcessingComplete = (data: any) => {
      console.log('[SOCKET MANAGER] ✅ processing_complete received:', data);

      const reportId = data.reportId || data.batchId;
      if (!reportId) return;

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: 'COMPLETE',
            message: data.message || 'Processing complete',
            progress: 100,
            data: data.data
          }
        }
      });
    };

    const handleProcessingError = (data: any) => {
      console.log('[SOCKET MANAGER] ❌ processing_error received:', data);

      const reportId = data.reportId || data.batchId;
      if (!reportId) return;

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: 'FAILED',
            message: data.error || 'Processing failed',
            progress: 0,
            data: data
          }
        }
      });
    };

    const handleProcessingStopped = (data: any) => {
      console.log('[SOCKET MANAGER] 🛑 processing_stopped received:', data);

      const reportId = data.reportId || data.batchId;
      if (!reportId) return;

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: 'STOPPED',
            message: 'Processing stopped',
            stopped: true,
            data: data
          }
        }
      });
    };

    const handleProcessingPaused = (data: any) => {
      console.log('[SOCKET MANAGER] ⏸️ processing_paused received:', data);

      const reportId = data.reportId || data.batchId;
      if (!reportId) return;

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: 'PAUSED',
            message: 'Processing paused',
            paused: true,
            data: data
          }
        }
      });
    };

    const handleProcessingResumed = (data: any) => {
      console.log('[SOCKET MANAGER] ▶️ processing_resumed received:', data);

      const reportId = data.reportId || data.batchId;
      if (!reportId) return;

      dispatch({
        type: 'UPDATE_PROGRESS',
        payload: {
          reportId,
          updates: {
            status: 'PROCESSING',
            message: 'Processing resumed',
            paused: false,
            data: data
          }
        }
      });
    };

    // Register all event listeners
    socket.on('macro_edit_progress', handleMacroEditProgress);
    socket.on('macro_edit_complete', handleMacroEditComplete);
    socket.on('macro_edit_error', handleMacroEditError);
    socket.on('processing_progress', handleProcessingProgress);
    socket.on('processing_complete', handleProcessingComplete);
    socket.on('processing_error', handleProcessingError);
    socket.on('processing_stopped', handleProcessingStopped);
    socket.on('processing_paused', handleProcessingPaused);
    socket.on('processing_resumed', handleProcessingResumed);

    console.log('[SOCKET MANAGER] ✅ All event listeners registered');

    // Cleanup function
    return () => {
      console.log('[SOCKET MANAGER] 🧹 Cleaning up socket listeners');
      socket.off('macro_edit_progress', handleMacroEditProgress);
      socket.off('macro_edit_complete', handleMacroEditComplete);
      socket.off('macro_edit_error', handleMacroEditError);
      socket.off('processing_progress', handleProcessingProgress);
      socket.off('processing_complete', handleProcessingComplete);
      socket.off('processing_error', handleProcessingError);
      socket.off('processing_stopped', handleProcessingStopped);
      socket.off('processing_paused', handleProcessingPaused);
      socket.off('processing_resumed', handleProcessingResumed);
      socket.offAny(handleAnyEvent);
    };
  }, [socket, dispatch]);
};