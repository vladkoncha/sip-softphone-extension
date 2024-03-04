import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";

export const IncomingCallWidget = observer(() => {
  const userAgentStore = useUserAgent();

  return (
    <div>
      <h1>Звонок от {userAgentStore.callStatus.user}</h1>
      <button onClick={() => userAgentStore.acceptIncomingCall()}>Ответить</button>
      <button onClick={() => userAgentStore.terminateCall()}>Сбросить</button>
    </div>
  );
});
