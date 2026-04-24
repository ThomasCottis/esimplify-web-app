import { useNavigate } from 'react-router-dom'
import AppLogo from '../components/ui/AppLogo'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <AppLogo />
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button className={styles.btn} onClick={() => navigate('/')}>
          Go home
        </button>
      </div>
    </div>
  )
}
