import { APP_NAME, APP_VERSION } from '../../config/appVersion.js';
import styles from './VersionFooter.module.css';

export default function VersionFooter() {
  return <footer className={styles.footer}>{APP_NAME} {APP_VERSION}</footer>;
}
