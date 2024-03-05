import { observer } from 'mobx-react-lite';

import { useUserAgent } from '../../app/store/user-agent-provider';
import { DeclineButton } from '../decline-button';
import { IconButton } from '../ui/icon-button/icon-button';
import { Phone } from '../ui/icons/phone';
import styles from './styles.module.css';

export const IncomingCallWidget = observer(() => {
  const userAgentStore = useUserAgent();

  return (
    <div className={styles['container']}>
      <h1>{userAgentStore.callStatus.user}</h1>
      <div className={styles['buttons-container']}>
        <IconButton
          // @ts-ignore
          title="Ответить"
          onClick={() => userAgentStore.acceptIncomingCall()}
          icon={Phone}
          style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: 'var(--green)',
          }}
        />
        <DeclineButton />
      </div>
    </div>
  );
});
