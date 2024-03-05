'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { useUserAgent } from '../../app/store/user-agent-provider';
import { Input } from '../ui/input';
import styles from './styles.module.css';

export const RegistrationForm = observer(() => {
  const [userData, setUserData] = useState({
    login: '',
    password: '',
    server: '',
    remember: true,
  });
  const [error, setError] = useState('');
  const userAgentStore = useUserAgent();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userAgentStore.errorMessage) {
      setError(userAgentStore.errorMessage);
      setIsLoading(false);
    } else {
      setError('');
    }
  }, [userAgentStore.errorMessage]);

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      setUserData({ ...userData, [name]: event.target.checked });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);

    userAgentStore.registerUserAgent(userData);
  };

  return (
    <div className={styles['container']}>
      <h2 className={styles['title']}>Регистрация пользователя</h2>
      <p className={styles['hint']}>
        Введите данные пользователя вашего SIP провайдера
      </p>
      <p className={styles['error']}>{error}</p>
      <form className={styles['form']} onSubmit={handleSubmit}>
        <div className={styles['form-items-container']}>
          <div className={styles['form-item']}>
            <label htmlFor="login">Логин:</label>
            <Input
              // @ts-ignore
              type="text"
              id="login"
              name="login"
              value={userData.login}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles['form-item']}>
            <label htmlFor="password">Пароль:</label>
            <Input
              // @ts-ignore
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles['form-item']}>
            <label htmlFor="server">Сервер:</label>
            <Input
              // @ts-ignore
              type="text"
              id="server"
              name="server"
              value={userData.server}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles['form-item-remember']}>
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={userData.remember}
              onChange={handleChange}
            />
            <label htmlFor="remember">Запомнить?</label>
          </div>
        </div>
        <button className={styles['button']} type="submit" disabled={isLoading}>
          Подключиться
        </button>
      </form>
    </div>
  );
});
