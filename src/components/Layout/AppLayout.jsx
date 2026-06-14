import styles from './AppLayout.module.css';

export default function AppLayout({ sidebar, toolbar, viewer, player, footer, toast }) {
  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebarSlot}>{sidebar}</aside>
      <main className={styles.mainArea}>
        <header className={styles.toolbarSlot}>{toolbar}</header>
        <section className={styles.viewerSlot}>{viewer}</section>
        <section className={styles.playerSlot}>{player}</section>
      </main>
      {footer}
      {toast}
    </div>
  );
}
