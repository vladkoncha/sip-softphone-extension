import { observer } from "mobx-react-lite";
import { useUserAgent } from "../../app/store/user-agent-provider";

export const CallStatus = observer(() => {
  const userAgentStore = useUserAgent();

  const duration = userAgentStore.callStatus.duration;

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const durationText = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  return (
    <div>
      <h1>{userAgentStore.callStatus.user}</h1>
      <p>Статус: {userAgentStore.callStatus.connectionStatus}</p>
      <p>{durationText}</p>
    </div>
  );
});
