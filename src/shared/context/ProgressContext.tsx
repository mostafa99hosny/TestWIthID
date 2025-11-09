import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface ProgressData {
  step?: number;
  total_steps?: number;
  total?: number;
  current?: number;
  percentage?: number;
  macro_id?: number;
  form_id?: string;
  error?: string;
  failedRecords?: number;
  numTabs?: number;
  progress_type?: any;
}

interface ProgressState {
  status: string;
  message: string;
  progress: number;
  paused: boolean;
  stopped: boolean;
  actionType?: "submit" | "retry" | "check";
  data?: ProgressData;

}

interface GlobalProgressState {
  [reportId: string]: ProgressState;
}

type ProgressAction =
  | { type: 'UPDATE_PROGRESS'; payload: { reportId: string; updates: Partial<ProgressState> } }
  | { type: 'CLEAR_PROGRESS'; payload: { reportId: string } }
  | { type: 'SET_PROGRESS_STATE'; payload: GlobalProgressState };

const ProgressContext = createContext<{
  progressStates: GlobalProgressState;
  dispatch: React.Dispatch<ProgressAction>;
} | undefined>(undefined);

// Reducer for managing progress state
function progressReducer(state: GlobalProgressState, action: ProgressAction): GlobalProgressState {
  switch (action.type) {
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        [action.payload.reportId]: {
          ...state[action.payload.reportId],
          ...action.payload.updates
        } as ProgressState
      };
    case 'CLEAR_PROGRESS':
      const newState = { ...state };
      delete newState[action.payload.reportId];
      return newState;
    case 'SET_PROGRESS_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [progressStates, dispatch] = useReducer(progressReducer, {});

  return (
    <ProgressContext.Provider value={{ progressStates, dispatch }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};