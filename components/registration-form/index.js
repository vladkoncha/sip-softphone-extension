// @ts-nocheck
import { useState } from "react";
import styles from "./styles.module.css";
import { Input } from "../ui/input";

export const RegistrationForm = ({ onLogin }) => {
  const [userData, setUserData] = useState({
    login: "",
    password: "",
    server: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onLogin(userData);
  };

  return (
    <div className={styles["container"]}>
      <h2 className={styles["title"]}>Регистрация пользователя</h2>
      <p className={styles["hint"]}>
        Введите данные пользователя вашего SIP провайдера
      </p>
      <form className={styles["form"]} onSubmit={handleSubmit}>
        <div className={styles["form-items-container"]}>
          <div className={styles["form-item"]}>
            <label htmlFor="login">Логин:</label>
            <Input
              type="text"
              id="login"
              name="login"
              value={userData.login}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles["form-item"]}>
            <label htmlFor="password">Пароль:</label>
            <Input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles["form-item"]}>
            <label htmlFor="server">Сервер:</label>
            <Input
              type="text"
              id="server"
              name="server"
              value={userData.server}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button className={styles["button"]} type="submit">
          Подключиться
        </button>
      </form>
    </div>
  );
};
