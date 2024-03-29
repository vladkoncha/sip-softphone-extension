'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { useRouter } from '../app/router';
import {
  CALL_PAGE,
  HOME_PAGE,
  INCOMING_PAGE,
  REGISTRATION_PAGE,
} from '../app/router';
import { useUserAgent } from '../app/store/user-agent-provider';
import { CallPage } from '../components/pages/call-page';
import { HomePage } from '../components/pages/home-page';
import { IncomingPage } from '../components/pages/incoming-page';
import { RegistrationPage } from '../components/pages/registration-page';
import styles from './styles.module.css';

function Home() {
  const router = useRouter();
  const audioRef = useRef(null);
  const userAgentStore = useUserAgent();

  useEffect(() => {
    userAgentStore.setAudioElement(audioRef.current);
  }, [userAgentStore]);

  useEffect(() => {
    // @ts-ignore
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return;
    }

    // @ts-ignore
    chrome.storage.session.get(['userLoginInfo'], (result) => {
      if (result.userLoginInfo) {
        userAgentStore.registerUserAgent(result.userLoginInfo);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles['page-container']}>
      <audio ref={audioRef} id="audio-element"></audio>
      {router.currentRoute === REGISTRATION_PAGE && <RegistrationPage />}
      {router.currentRoute === HOME_PAGE && <HomePage />}
      {router.currentRoute === CALL_PAGE && <CallPage />}
      {router.currentRoute === INCOMING_PAGE && <IncomingPage />}
    </div>
  );
}

export default observer(Home);
