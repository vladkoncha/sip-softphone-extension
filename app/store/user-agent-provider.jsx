'use client';

import { createContext, useContext } from 'react';

import { UserAgentStore } from './user-agent-store';

export const UserAgentContext = createContext(null);
const userAgentStore = new UserAgentStore();

export const useUserAgent = () => useContext(UserAgentContext);

export function UserAgentProvider({ children }) {
  return (
    <UserAgentContext.Provider value={userAgentStore}>
      {children}
    </UserAgentContext.Provider>
  );
}
