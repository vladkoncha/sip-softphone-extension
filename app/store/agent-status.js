export const AgentStatus = {
  UNREGISTERED: 'UNREGISTERED',
  DEFAULT: 'DEFAULT',
  CALL_INCOMING: 'CALL_INCOMING',
  CALL_CONNECTING: 'CALL_CONNECTING',
  CALL_IN_PROGRESS: 'CALL_IN_PROGRESS',
  CALL_CONFIRMED: 'CALL_CONFIRMED',
  CALL_TERMINATED: 'CALL_TERMINATED',
};

export const CALL_STATUS_MAP = {
  [AgentStatus.UNREGISTERED]: '',
  [AgentStatus.DEFAULT]: '',
  [AgentStatus.CALL_INCOMING]: '',
  [AgentStatus.CALL_CONNECTING]: 'Соединяем',
  [AgentStatus.CALL_IN_PROGRESS]: 'Звоним',
  [AgentStatus.CALL_CONFIRMED]: 'В процессе',
  [AgentStatus.CALL_TERMINATED]: 'Завершен',
};
