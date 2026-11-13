import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import styles from './AppLayout.css';

export const AppLayout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.mainWrapper}>
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
