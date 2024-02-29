"use client";

import { createContext, useContext } from "react";
import { UserAgentStore } from "./user-agent-store";
import { useRouter } from "../router/router";

export const UserAgentContext = createContext(null);
export const userAgentStore = new UserAgentStore();

export const useUserAgent = () => useContext(UserAgentContext);

const setUserAgentStoreRouter = (navigateTo) => {
  userAgentStore.setRouter(navigateTo);
};

export function UserAgentProvider({ children }) {
  const { navigateTo } = useRouter();
  setUserAgentStoreRouter(navigateTo);

  return (
    <UserAgentContext.Provider value={userAgentStore}>
      {children}
    </UserAgentContext.Provider>
  );
}
