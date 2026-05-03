import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/react'
import styles from './Sidebar.module.css'

function IconDashboard() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function IconInsurance() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 1.5L2.5 4.5v4c0 4 2.9 6.7 6.5 7.5 3.6-.8 6.5-3.5 6.5-7.5v-4L9 1.5z" />
      <path d="M6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconNegotiations() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9h12M3 5h8M3 13h5" strokeLinecap="round" />
      <circle cx="14" cy="13" r="2.5" />
      <path d="M13.3 13h1.4M14 12.3v1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconHowItWorks() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="9" r="7" />
      <line x1="9" y1="8" x2="9" y2="12" strokeLinecap="round" />
      <circle cx="9" cy="6" r="0.5" fill="currentColor" />
    </svg>
  )
}

function IconLogOut() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 9h8M11.5 6l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 3.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H11" strokeLinecap="round" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="6" r="3" />
      <path d="M2.5 15.5c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" strokeLinecap="round" />
    </svg>
  )
}

export default function Sidebar() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const firstName = user?.firstName ?? ''
  const lastName = user?.lastName ?? ''
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const fullName = ([firstName, lastName].filter(Boolean).join(' ')) || email || 'User'
  const initials = ([firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase()) || (email[0]?.toUpperCase() ?? 'U')
  const imageUrl = user?.imageUrl

  function handleProfile() {
    setMenuOpen(false)
    navigate('/profile')
  }

  function handleSignOut() {
    setMenuOpen(false)
    signOut({ redirectUrl: '/' })
  }

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/logo/esimplify-logo.png" alt="eSimplify" className={styles.brandMark} />
          <span className={styles.brandName}>eSimplify</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>Main</div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <IconDashboard />
              Dashboard
            </NavLink>
            <NavLink
              to="/connect-insurance"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <IconInsurance />
              Insurance
            </NavLink>
            <NavLink
              to="/negotiations"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <IconNegotiations />
              Negotiations
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <IconHowItWorks />
              How It Works
            </NavLink>
          </div>
        </nav>

        <div className={styles.footer}>
          <button
            className={`${styles.userRow} ${menuOpen ? styles.active : ''}`}
            onClick={() => setMenuOpen(v => !v)}
          >
            <div className={styles.avatar}>
              {imageUrl ? (
                <img src={imageUrl} alt={fullName} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitials}>{initials}</span>
              )}
            </div>
            <span className={styles.footerLabel}>Profile</span>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{fullName}</div>
              {email && <div className={styles.userEmail}>{email}</div>}
            </div>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setMenuOpen(false)} />
          <div className={styles.modal}>
            <div className={styles.modalAvatar}>
              {imageUrl ? (
                <img src={imageUrl} alt={fullName} className={styles.modalAvatarImg} />
              ) : (
                <span className={styles.modalAvatarInitials}>{initials}</span>
              )}
            </div>
            <div className={styles.modalName}>{fullName}</div>
            {email && <div className={styles.modalEmail}>{email}</div>}
            <div className={styles.modalActions}>
              <button className={styles.modalBtnPrimary} onClick={handleProfile}>
                <IconUser />
                Profile
              </button>
              <button className={styles.modalBtnSecondary} onClick={handleSignOut}>
                <IconLogOut />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
