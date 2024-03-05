'use client';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import {
  CONNECTION_STATUS_MAP,
  ConnectionStatus,
} from '../../app/store/connection-status';
import { useUserAgent } from '../../app/store/user-agent-provider';
import { IconButton } from '../ui/icon-button/icon-button';
import { ExternalLink } from '../ui/icons/external-link';
import styles from './styles.module.css';

export const Header = observer(() => {
  const userAgentStore = useUserAgent();

  return (
    <div className={styles.header}>
      <p
        className={clsx(styles['status'], {
          [styles['connected']]:
            userAgentStore.connectionStatus === ConnectionStatus.CONNECTED,
          [styles['disconnected']]:
            userAgentStore.connectionStatus === ConnectionStatus.DISCONNECTED,
        })}
      >
        {CONNECTION_STATUS_MAP[userAgentStore.connectionStatus]}
      </p>

      <IconButton
        // @ts-ignore
        title="Открыть в новой вкладке"
        style={{ width: '2rem', height: '2rem' }}
        icon={ExternalLink}
        onClick={() =>
          // @ts-ignore
          chrome?.tabs?.create({ url: chrome.runtime.getURL('index.html') })
        }
      />
    </div>
  );
});
