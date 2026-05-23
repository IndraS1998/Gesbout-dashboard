import { useEffect, useRef, useState } from "react";
import styles from "./component.module.css";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (open && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function onLogout() {
    setOpen(false);
    // TODO: wire to your auth:
    // - next-auth: signOut()
    // - custom: fetch('/api/logout') then redirect
    console.log("Logout clicked");
  }

  return (
    <nav className={`${styles.topnav} ${styles.noPrint}`}>
      <div className={styles.navBrand}>
        <div className={styles.navBrandIcon}>R</div>

        <div className={styles.brandText}>
          <span className={styles.navBrandName}>Ristourne Dashboard</span>
          <span className={styles.navBrandSub}>GOLOMBE Network</span>
        </div>
      </div>

      <div className={styles.navRight}>
        <div className={`${styles.golombeMark} ${styles.noPrint}`}>
          <div className={styles.golombeRing}></div>
          GOLOMBE
        </div>

        {/* User + dropdown */}
        <div className={styles.userMenu} ref={menuRef}>
          <button
            type="button"
            className={styles.navUserBtn}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <div className={styles.navAvatar} aria-hidden="true">
              AD
            </div>
            <span className={styles.adminName}>Admin</span>
          </button>

          {open && (
            <>
              {/* Optional click-catcher overlay for mobile (also closes) */}
              <button
                className={styles.backdrop}
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                type="button"
              />

              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>AD</div>
                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownName}>Admin</div>
                    <div className={styles.dropdownSub}>Signed in</div>
                  </div>
                </div>

                <div className={styles.dropdownDivider} />

                <button
                  type="button"
                  className={styles.dropdownItemDanger}
                  onClick={onLogout}
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}