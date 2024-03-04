import JsSIP from "jssip";
import { makeAutoObservable, runInAction } from "mobx";
import {
  DEFAULT_ERROR,
  NO_CONNECTION_ERROR,
  REGISTRATION_ERROR,
} from "./errors";
import { AgentStatus } from "./agent-status";
import { ConnectionStatus } from "./connection-status";
import { CALL_ERROR_MESSAGES } from "./call-error-messages";
import { CallType } from "./call-type";

export class UserAgentStore {
  agentStatus = AgentStatus.UNREGISTERED;
  connectionStatus = ConnectionStatus.DISCONNECTED;
  userAgent = null;
  errorMessage = "";
  #userLoginInfo = null;
  callStatus = {
    user: "",
    duration: 0, // in seconds
    type: null,
  };
  #callDurationIntervalId = null;
  #connectionIntervalId = null;
  #currentSession = null;
  #callHistory = [];
  #audioElement = null;

  constructor() {
    makeAutoObservable(this);
    this.#initCleanup();
  }

  #setUserAgent(userAgent) {
    this.userAgent = userAgent;
  }

  clearError() {
    this.errorMessage = "";
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

  #setAudioStream() {
    this.#currentSession.connection.addEventListener("addstream", (event) => {
      console.log(this.#audioElement);
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

  #initCallHistory() {
    const userLogin = this.#userLoginInfo.login;

    // @ts-ignore
    if (typeof chrome === "undefined" || !chrome.storage) {
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
      } else {
        console.log("No call history found for user:", userLogin);
      }
    });
  }

  #initCleanup() {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("beforeunload", () => {
      if (this.userAgent) {
        this.userAgent.stop();
      }

      if (this.#connectionIntervalId) {
        clearInterval(this.#connectionIntervalId);
      }

      if (this.#callDurationIntervalId) {
        clearInterval(this.#callDurationIntervalId);
      }
    });
  }

  #saveCallToHistory() {
    const callDate = new Date();
    callDate.setSeconds(callDate.getSeconds() - this.callStatus.duration);
    const newCall = { ...this.callStatus, date: callDate };
    this.#callHistory.unshift(newCall);

    // @ts-ignore
    if (typeof chrome === "undefined" || !chrome.storage) {
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
      chrome.storage.local.set({ [userLogin]: serializedCallHistory }, () => {
        console.log("Call added to history and saved for user:", userLogin);
      });
    });
  }

  #keepConnected() {
    if (this.#connectionIntervalId) {
      clearInterval(this.#connectionIntervalId);
    }

    this.#connectionIntervalId = setInterval(() => {
      if (this.userAgent?.isConnected()) {
        const eventHandlers = {
          succeeded: (data) => {
            runInAction(() => {
              this.connectionStatus = ConnectionStatus.CONNECTED;
            });
            console.log("option success", data);
          },
          failed: (data) => {
            console.log("option fail", data);
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
    if (e?.originator !== "remote" || !e.session) {
      return;
    }
    console.log(e);

    // Incoming calls during another call in progress are ignored
    if (this.agentStatus !== AgentStatus.DEFAULT) {
      return;
    }

    const { session } = e;

    session.on("progress", this.#handleIncomingCallProgress);
    session.on("confirmed", this.#handleCallConfirmed);
    session.on("ended", this.#handleCallEnded);
    session.on("failed", this.#handleCallFailed);

    runInAction(() => {
      this.#currentSession = session;
      this.#initCallStatus(session.remote_identity.uri.user, CallType.INCOMING);
    });
  };

  #handleIncomingCallProgress = (e) => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_INCOMING;
    });
    console.log("incoming call in progress", e);
  };

  acceptIncomingCall() {
    this.#currentSession.answer();
    this.#setAudioStream();
  }

  terminateCall() {
    this.#currentSession.terminate();
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

    userAgent.on("connected", this.#handleConnected);
    userAgent.on("disconnected", this.#handleDisconnected);
    userAgent.on("registered", this.#handleRegistered);
    userAgent.on("registrationFailed", this.#handleRegistrationFailed);
    userAgent.on("newRTCSession", this.#handleIncomingCall);

    this.#setUserAgent(userAgent);
    this.#initCallHistory();
    this.#keepConnected();

    console.log(userAgent);

    this.userAgent.start();
  }

  #handleConnected = (e) => {
    runInAction(() => (this.connectionStatus = ConnectionStatus.CONNECTED));
    console.log("Connected to SIP server", e);
  };

  #handleDisconnected = (e) => {
    if (e.error) {
      runInAction(() => {
        this.setError(`Ошибка: ${e?.cause ?? NO_CONNECTION_ERROR}`);
      });
      this.userAgent.stop();
    }
    console.log("Disconnected from SIP server", e);
  };

  #handleRegistered = (e) => {
    console.log("Registered with SIP server", e);
    if (this.#userLoginInfo?.remember) {
      sessionStorage.setItem(
        "userLoginInfo",
        JSON.stringify(this.#userLoginInfo)
      );
    }
    runInAction(() => (this.agentStatus = AgentStatus.DEFAULT));
  };

  #handleRegistrationFailed = (e) => {
    runInAction(() => this.setError(REGISTRATION_ERROR));
    console.log("Registration failed with SIP server", e);
    console.log(this.userAgent);
  };

  #handleCallFailed = (e) => {
    runInAction(() => {
      if (e.originator !== "local") {
        this.setError(
          CALL_ERROR_MESSAGES?.[e?.message?.status_code] ?? DEFAULT_ERROR
        );
      }

      this.agentStatus = AgentStatus.DEFAULT;
    });

    console.log("Call failed", e);
  };

  #handleCallInProgress = (e) => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_IN_PROGRESS;
    });
    console.log("call in progress", e);
  };

  #handleCallConfirmed = (e) => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_CONFIRMED;
      this.#callDurationIntervalId = setInterval(
        () => runInAction(() => this.#updateDuration()),
        1_000
      );
    });
    console.log("call confirmed", e);
  };

  #handleCallEnded = (e) => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_TERMINATED;

      setTimeout(
        () => runInAction(() => (this.agentStatus = AgentStatus.DEFAULT)),
        3_000
      );

      clearInterval(this.#callDurationIntervalId);
      this.#callDurationIntervalId = null;
      this.#saveCallToHistory();
    });
    console.log("call ended", e);
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
    console.log("out call session", this.#currentSession);

    this.#initCallStatus(calledUserLogin, CallType.OUTGOING);
    this.agentStatus = AgentStatus.CALL_CONNECTING;
  }
}
