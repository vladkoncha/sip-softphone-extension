"use client";

import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";
import { getFormattedDuration } from "../../utils/getFormattedDuration";

export const CallStatus = observer(() => {
  const userAgentStore = useUserAgent();

  const duration = userAgentStore.callStatus.duration;

  return (
    <div>
      <h1>{userAgentStore.callStatus.user}</h1>
      <p>Статус: {userAgentStore.agentStatus}</p>
      <p>{getFormattedDuration(duration)}</p>
      <button onClick={() => userAgentStore.terminateCall()}>Сбросить</button>
    </div>
  );
});
