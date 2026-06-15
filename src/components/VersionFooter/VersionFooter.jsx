import { APP_VERSION_LABEL } from '../../config/appVersion.js';
import styles from './VersionFooter.module.css';

export default function VersionFooter() {
  return <footer className={styles.footer}>{APP_VERSION_LABEL}</footer>;
}
