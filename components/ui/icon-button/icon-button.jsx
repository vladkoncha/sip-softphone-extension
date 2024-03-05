import { forwardRef } from 'react';

import styles from './styles.module.css';

const IconButton = forwardRef(({ icon: Icon, onClick, ...rest }, ref) => {
  return (
    <button
      type="button"
      className={styles['icon-button']}
      ref={ref}
      onClick={onClick}
      {...rest}
    >
      <Icon />
    </button>
  );
});

IconButton.displayName = 'IconButton';
export { IconButton };
