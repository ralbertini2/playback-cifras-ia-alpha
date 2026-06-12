import styles from './AppLayout.module.css';

export default function AppLayout({ sidebar, toolbar, viewer, player, footer, toast }) {
  return (
    <div className={styles.appShell}>
      {sidebar}
      <main className={styles.main}>
        {toolbar}
        {viewer}
        {player}
      </main>
      {footer}
      {toast}
    </div>
  );
}
