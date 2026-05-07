import React from 'react';
import styles from './Btn.module.css';

export default function Btn({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, className }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className || ''}`}>
      {children}
    </button>
  );
}
