// MobXStore.js
import JsSIP from "jssip";
import { makeAutoObservable } from "mobx";
import { REGISTRATION_ERROR } from "./errors";
import { HOME_PAGE } from "../router/routes";

export class UserAgentStore {
  userAgent = null;
  errorMessage = "";
  navigate = null;

  constructor() {
    makeAutoObservable(this);
  }

  setRouter(navigate) {
    this.navigate = navigate;
  }

  setUserAgent(userAgent) {
    this.userAgent = userAgent;
  }

  clearError() {
    this.errorMessage = "";
  }

  registerUserAgent({ login, password, server }) {
    this.clearError();

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
      this.errorMessage = REGISTRATION_ERROR;
      return;
    }

    userAgent.on("connected", this.handleConnected);
    userAgent.on("disconnected", this.handleDisconnected);
    userAgent.on("registered", this.handleRegistered);
    userAgent.on("registrationFailed", this.handleRegistrationFailed);

    this.setUserAgent(userAgent);
    this.userAgent.start();
  }

  handleConnected = (e) => {
    console.log("Connected to SIP server", e);
  };

  handleDisconnected = (e) => {
    if (e.error) {
      this.errorMessage = REGISTRATION_ERROR;
      this.userAgent.stop();
    }
    console.log("Disconnected from SIP server", e);
  };

  handleRegistered = (e) => {
    console.log("Registered with SIP server", e);
    this.navigate(HOME_PAGE);
  };

  handleRegistrationFailed = (e) => {
    this.errorMessage = REGISTRATION_ERROR;
    console.log("Registration failed with SIP server", e);
  };
}
