import JsSIP from 'jssip';
import { makeAutoObservable, runInAction } from 'mobx';

import { AgentStatus } from './agent-status';
import { CALL_ERROR_MESSAGES } from './call-error-messages';
import { CallType } from './call-type';
import { ConnectionStatus } from './connection-status';
import {
  CANCELLED as CANCELED,
  DEFAULT_ERROR,
  NO_CONNECTION_ERROR,
  REGISTRATION_ERROR,
} from './errors';

export class UserAgentStore {
  agentStatus = AgentStatus.UNREGISTERED;
  connectionStatus = ConnectionStatus.DISCONNECTED;
  userAgent = null;
  errorMessage = '';
  callStatus = {
    user: '',
    duration: 0, // in seconds
    type: null,
  };
  #userLoginInfo = null;
  #callDurationIntervalId = null;
  #connectionIntervalId = null;
  #currentSession = null;
  #callHistory = [];
  #audioElement = null;

  constructor() {
    makeAutoObservable(this);
    this.#initCleanup();
  }

  clearError() {
    this.errorMessage = '';
  }

  setError(errorMessage) {
    this.errorMessage = errorMessage;
    setTimeout(() => runInAction(() => this.clearError()), 5_000);
  }

  #updateDuration() {
    if (!this.agentStatus) return;
    this.callStatus.duration++;
  }

  getCallHistory() {
    return this.#callHistory;
  }

  #initCallHistory() {
    const userLogin = this.#userLoginInfo.login;

    // @ts-ignore
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return;
    }

    // @ts-ignore
    chrome.storage.local.get([userLogin], (result) => {
      const serializedCallHistory = result[userLogin];
      if (serializedCallHistory) {
        const callHistoryData = JSON.parse(serializedCallHistory);

        this.#callHistory = callHistoryData.map((callData) => ({
          ...callData,
          date: new Date(callData.date),
        }));
      }
    });
  }

  #saveCallToHistory() {
    const callDate = new Date();
    callDate.setSeconds(callDate.getSeconds() - this.callStatus.duration);
    const newCall = { ...this.callStatus, date: callDate };
    this.#callHistory.unshift(newCall);

    // @ts-ignore
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return;
    }

    const userLogin = this.#userLoginInfo.login;

    // @ts-ignore
    chrome.storage.local.get([userLogin], (result) => {
      let callHistoryData = result[userLogin]
        ? JSON.parse(result[userLogin])
        : [];

      callHistoryData.unshift(newCall);

      const serializedCallHistory = JSON.stringify(callHistoryData);

      // @ts-ignore
      chrome.storage.local.set({ [userLogin]: serializedCallHistory });
    });
  }

  #setAudioStream() {
    this.#currentSession?.connection.addEventListener('addstream', (event) => {
      if (!this.#audioElement) {
        return;
      }

      this.#audioElement.srcObject = event.stream;
      this.#audioElement.play();
    });
  }

  setAudioElement(audioElement) {
    this.#audioElement = audioElement;
  }

  #initCleanup = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('beforeunload', () => {
      runInAction(() => this.#resetState());
    });
  };

  #resetState() {
    this.userAgent?.stop();

    if (this.#connectionIntervalId) {
      clearInterval(this.#connectionIntervalId);
    }

    if (this.#callDurationIntervalId) {
      clearInterval(this.#callDurationIntervalId);
    }

    this.agentStatus = AgentStatus.UNREGISTERED;
    this.userAgent = null;
    this.connectionStatus = ConnectionStatus.DISCONNECTED;
    this.errorMessage = '';
    this.#userLoginInfo = null;
    this.callStatus = {
      user: '',
      duration: 0,
      type: null,
    };
    this.#callDurationIntervalId = null;
    this.#connectionIntervalId = null;
    this.#currentSession = null;
    this.#callHistory = [];
  }

  #keepConnected() {
    if (this.#connectionIntervalId) {
      clearInterval(this.#connectionIntervalId);
    }

    this.#connectionIntervalId = setInterval(() => {
      if (this.userAgent?.isConnected()) {
        const eventHandlers = {
          succeeded: () => {
            runInAction(() => {
              this.connectionStatus = ConnectionStatus.CONNECTED;
            });
          },
          failed: () => {
            this.userAgent.terminateSessions();
            runInAction(
              () => (this.connectionStatus = ConnectionStatus.DISCONNECTED)
            );
          },
        };

        const options = {
          eventHandlers: eventHandlers,
        };

        this.userAgent.sendOptions(
          `sip:${this.#userLoginInfo.login}@${this.#userLoginInfo.server}`,
          null,
          options
        );
      } else {
        runInAction(
          () => (this.connectionStatus = ConnectionStatus.DISCONNECTED)
        );
      }
    }, 15_000);
  }

  #handleIncomingCall = (e) => {
    if (e?.originator !== 'remote' || !e.session) {
      return;
    }

    // Incoming calls during another call in progress are ignored
    if (this.agentStatus !== AgentStatus.DEFAULT) {
      return;
    }

    const { session } = e;

    session.on('progress', this.#handleIncomingCallProgress);
    session.on('confirmed', this.#handleCallConfirmed);
    session.on('ended', this.#handleCallEnded);
    session.on('failed', this.#handleCallFailed);

    runInAction(() => {
      this.#currentSession = session;
      this.#initCallStatus(session.remote_identity.uri.user, CallType.INCOMING);
    });
  };

  // @ts-ignore
  #handleIncomingCallProgress = (e) => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_INCOMING;
    });
  };

  acceptIncomingCall() {
    this.#currentSession?.answer();
    this.#setAudioStream();
  }

  terminateCall() {
    this.#currentSession?.terminate();
  }

  logout() {
    this.#resetState();

    // @ts-ignore
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return;
    }

    // @ts-ignore
    chrome.storage.session.remove('userLoginInfo');
  }

  registerUserAgent({ login, password, server, remember }) {
    this.clearError();

    this.#userLoginInfo = { login, password, server, remember };

    const socket = new JsSIP.WebSocketInterface(`wss:/${server}`);
    const configuration = {
      sockets: [socket],
      uri: `sip:${login}@${server}`,
      password,
    };

    let userAgent = null;
    try {
      userAgent = new JsSIP.UA(configuration);
    } catch {
      runInAction(() => {
        this.setError(REGISTRATION_ERROR);
      });
      return;
    }

    userAgent.on('connected', this.#handleConnected);
    userAgent.on('disconnected', this.#handleDisconnected);
    userAgent.on('registered', this.#handleRegistered);
    userAgent.on('registrationFailed', this.#handleRegistrationFailed);
    userAgent.on('newRTCSession', this.#handleIncomingCall);

    this.userAgent = userAgent;
    this.#initCallHistory();
    this.#keepConnected();

    this.userAgent.start();
  }

  // @ts-ignore
  #handleConnected = (e) => {
    runInAction(() => (this.connectionStatus = ConnectionStatus.CONNECTED));
  };

  #handleDisconnected = (e) => {
    if (e.error) {
      runInAction(() => {
        this.setError(`Ошибка: ${e?.cause ?? NO_CONNECTION_ERROR}`);
      });
      this.userAgent.stop();
    }
  };

  // @ts-ignore
  #handleRegistered = (e) => {
    runInAction(() => (this.agentStatus = AgentStatus.DEFAULT));

    if (this.#userLoginInfo?.remember) {
      // @ts-ignore
      if (typeof chrome === 'undefined' || !chrome.storage) {
        return;
      }

      // @ts-ignore
      chrome.storage.session.set({
        userLoginInfo: this.#userLoginInfo,
      });
    }
  };

  // @ts-ignore
  #handleRegistrationFailed = (e) => {
    runInAction(() => this.setError(REGISTRATION_ERROR));
  };

  #handleCallFailed = (e) => {
    runInAction(() => {
      this.#saveCallToHistory();
      this.agentStatus = AgentStatus.DEFAULT;

      if (e.originator === 'local') {
        return;
      }

      if (e?.message?.method === 'CANCEL') {
        this.setError(CANCELED);
      } else {
        this.setError(
          CALL_ERROR_MESSAGES?.[e?.message?.status_code] ?? DEFAULT_ERROR
        );
      }
    });
  };

  #handleCallInProgress = () => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_IN_PROGRESS;
    });
  };

  #handleCallConfirmed = () => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_CONFIRMED;
      this.#callDurationIntervalId = setInterval(
        () => runInAction(() => this.#updateDuration()),
        1_000
      );
    });
  };

  #handleCallEnded = () => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_TERMINATED;
      this.#currentSession = null;

      setTimeout(
        () => runInAction(() => (this.agentStatus = AgentStatus.DEFAULT)),
        2_000
      );

      clearInterval(this.#callDurationIntervalId);
      this.#callDurationIntervalId = null;
      this.#saveCallToHistory();
    });
  };

  #initCallStatus(userLogin, callType) {
    this.callStatus.duration = 0;
    this.callStatus.user = userLogin;
    this.callStatus.type = callType;
  }

  call(calledUserLogin) {
    const eventHandlers = {
      progress: this.#handleCallInProgress,
      confirmed: this.#handleCallConfirmed,
      ended: this.#handleCallEnded,
      failed: this.#handleCallFailed,
    };

    const options = {
      eventHandlers: eventHandlers,
      mediaConstraints: { audio: true, video: false },
    };

    this.#currentSession = this.userAgent.call(
      `sip:${calledUserLogin}@${this.#userLoginInfo.server}`,
      options
    );
    this.#setAudioStream();

    this.#initCallStatus(calledUserLogin, CallType.OUTGOING);
    this.agentStatus = AgentStatus.CALL_CONNECTING;
  }
}
