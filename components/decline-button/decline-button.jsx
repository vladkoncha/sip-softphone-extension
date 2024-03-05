'use client';

import { useUserAgent } from '../../app/store/user-agent-provider';
import { IconButton } from '../ui/icon-button/icon-button';
import { Cross } from '../ui/icons/cross';

export const DeclineButton = (props) => {
  const userAgentStore = useUserAgent();

  return (
    <IconButton
      // @ts-ignore
      title="Сбросить"
      onClick={() => userAgentStore.terminateCall()}
      icon={Cross}
      style={{
        width: '4rem',
        height: '4rem',
        backgroundColor: 'var(--decline-red)',
        ...props?.style,
      }}
    />
  );
};
