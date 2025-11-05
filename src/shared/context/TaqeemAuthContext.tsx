import { createContext, useContext, useState, ReactNode } from 'react';

interface TaqeemAuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const TaqeemAuthContext = createContext<TaqeemAuthContextType | undefined>(undefined);

export function TaqeemAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <TaqeemAuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </TaqeemAuthContext.Provider>
  );
}

export function useTaqeemAuth() {
  const context = useContext(TaqeemAuthContext);
  if (context === undefined) {
    throw new Error('useTaqeemAuth must be used within a TaqeemAuthProvider');
  }
  return context;
}