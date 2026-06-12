import { APP_NAME, APP_VERSION } from '../../config/appVersion.js';
import styles from './VersionFooter.module.css';

export default function VersionFooter() {
  return <div className={styles.version}>{APP_NAME} {APP_VERSION}</div>;
}
