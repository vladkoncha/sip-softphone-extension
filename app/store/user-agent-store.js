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

export class UserAgentStore {
  agentStatus = AgentStatus.UNREGISTERED;
  connectionStatus = ConnectionStatus.DISCONNECTED;
  userAgent = null;
  errorMessage = "";
  #userLoginInfo = null;
  callStatus = {
    user: "",
    duration: 0, // in seconds
  };
  #callDurationIntervalId = null;
  #incomingSession = null;

  constructor() {
    makeAutoObservable(this);
    this.#keepConnected();
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

  #keepConnected() {
    setInterval(() => {
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

    const { session } = e;

    session.on("progress", this.#handleIncomingCallProgress);
    session.on("confirmed", this.#handleCallConfirmed);
    session.on("ended", this.#handleCallEnded);
    session.on("failed", this.#handleCallFailed);

    runInAction(() => {
      this.#incomingSession = session;
      this.callStatus.user = session.remote_identity.uri.user;
    });
  };

  #handleIncomingCallProgress = (e) => {
    runInAction(() => {
      this.agentStatus = AgentStatus.CALL_INCOMING;
    });
    console.log("incoming call in progress", e);
  };

  acceptIncomingCall() {
    this.#incomingSession.answer();
  }

  declineIncomingCall() {
    this.#incomingSession.terminate();
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
      this.callStatus.duration = 0;
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
    });
    console.log("call ended", e);
  };

  call(calledUserLogin) {
    this.agentStatus = AgentStatus.CALL_CONNECTING;
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

    const session = this.userAgent.call(
      `sip:${calledUserLogin}@${this.#userLoginInfo.server}`,
      options
    );
    console.log("session", session);

    runInAction(() => {
      this.callStatus.user = calledUserLogin;
    });
  }
}
