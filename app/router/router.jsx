import { observer } from 'mobx-react-lite';
import { createContext, useContext, useEffect, useState } from 'react';

import { AgentStatus } from '../store/agent-status';
import { useUserAgent } from '../store/user-agent-provider';
import {
  CALL_PAGE,
  HOME_PAGE,
  INCOMING_PAGE,
  REGISTRATION_PAGE,
} from './routes';

const RouterContext = createContext(null);

export const useRouter = () => useContext(RouterContext);

const routeMap = {
  [AgentStatus.CALL_INCOMING]: INCOMING_PAGE,
  [AgentStatus.CALL_CONNECTING]: CALL_PAGE,
  [AgentStatus.CALL_IN_PROGRESS]: CALL_PAGE,
  [AgentStatus.CALL_CONFIRMED]: CALL_PAGE,
  [AgentStatus.CALL_TERMINATED]: CALL_PAGE,
  [AgentStatus.DEFAULT]: HOME_PAGE,
  [AgentStatus.UNREGISTERED]: REGISTRATION_PAGE,
};

// @ts-ignore
export const RouterProvider = observer(({ children }) => {
  const [currentRoute, setCurrentRoute] = useState(REGISTRATION_PAGE);
  const userAgentStore = useUserAgent();

  const navigateTo = (route) => {
    setCurrentRoute(route);
  };

  useEffect(() => {
    navigateTo(routeMap[userAgentStore.agentStatus]);
  }, [userAgentStore.agentStatus]);

  const value = {
    currentRoute,
    navigateTo,
  };

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
});
