import JsSIP from "jssip";
import { makeAutoObservable, runInAction } from "mobx";
import { DEFAULT_ERROR, REGISTRATION_ERROR } from "./errors";
import { HOME_PAGE } from "../router/routes";
import { CONFIRMED, DEFAULT, IN_PROGRESS, TERMINATED } from "./call-status";

export class UserAgentStore {
  userAgent = null;
  errorMessage = "";
  navigate = null;
  #userLoginInfo = null;
  callStatus = {
    user: "",
    duration: 0, // in seconds
    connectionStatus: DEFAULT,
  };
  #callDurationIntervalId = null;

  constructor() {
    makeAutoObservable(this);
    this.#keepConnected();
  }

  setRouter(navigate) {
    this.navigate = navigate;
  }

  #setUserAgent(userAgent) {
    this.userAgent = userAgent;
  }

  clearError() {
    this.errorMessage = "";
  }

  #updateDuration() {
    if (!this.callStatus?.connectionStatus) return;
    this.callStatus.duration++;
  }

  #keepConnected() {
    setInterval(() => {
      if (this.userAgent?.isConnected()) {
        const eventHandlers = {
          succeeded: (data) => {
            runInAction(() => this.clearError());
            console.log("option success", data);
          },
          failed: (data) => {
            console.log("option fail", data);
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
      }
    }, 30_000);
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
        this.errorMessage = REGISTRATION_ERROR;
      });
      return;
    }

    userAgent.on("connected", this.#handleConnected);
    userAgent.on("disconnected", this.#handleDisconnected);
    userAgent.on("registered", this.#handleRegistered);
    userAgent.on("registrationFailed", this.#handleRegistrationFailed);

    this.#setUserAgent(userAgent);

    this.userAgent.start();
  }

  #handleConnected = (e) => {
    console.log("Connected to SIP server", e);
  };

  #handleDisconnected = (e) => {
    if (e.error) {
      runInAction(() => {
        this.errorMessage = `Ошибка: ${e?.cause ?? DEFAULT_ERROR}`;
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
    this.navigate(HOME_PAGE);
  };

  #handleRegistrationFailed = (e) => {
    runInAction(() => {
      this.errorMessage = REGISTRATION_ERROR;
    });
    console.log("Registration failed with SIP server", e);
    console.log(this.userAgent);
  };

  #handleCallFailed = (e) => {
    runInAction(() => {
      this.errorMessage = `Ошибка вызова: ${e?.cause ?? DEFAULT_ERROR}`;
      setTimeout(
        () => runInAction(() => (this.callStatus.connectionStatus = DEFAULT)),
        3_000
      );
    });
    console.log("Call failed", e);
  };

  #handleCallInProgress = (e) => {
    runInAction(() => {
      this.callStatus.connectionStatus = IN_PROGRESS;
    });
    console.log("call in progress", e);
  };

  #handleCallConfirmed = (e) => {
    runInAction(() => {
      this.callStatus.connectionStatus = CONFIRMED;
      this.#callDurationIntervalId = setInterval(
        () => runInAction(() => this.#updateDuration()),
        1_000
      );
    });
    console.log("call confirmed", e);
  };

  #handleCallEnded = (e) => {
    runInAction(() => {
      this.callStatus.connectionStatus = TERMINATED;

      setTimeout(
        () => runInAction(() => (this.callStatus.connectionStatus = DEFAULT)),
        3_000
      );

      clearInterval(this.#callDurationIntervalId);
      this.#callDurationIntervalId = null;
    });
    console.log("call in progress", e);
  };

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
