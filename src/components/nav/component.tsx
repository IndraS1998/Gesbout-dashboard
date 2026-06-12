"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./component.module.css";

export default function Nav() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    {
      label: "Consultation",
      href: "/consultation",
    },
    {
      label: "Liste Filleuls",
      href: "/child-list",
    },
  ];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;

      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }

      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open, mobileMenuOpen]);

  function onLogout() {
    setOpen(false);

    // TODO:
    // localStorage.removeItem("token");
    // router.replace("/connexion");

    console.log("Logout clicked");
  }

  return (
    <>
      {(open || mobileMenuOpen) && (
        <button
          className={styles.backdrop}
          aria-label="Close menu"
          type="button"
          onClick={() => {
            setOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}

      <nav className={`${styles.topnav} ${styles.noPrint}`}>
        {/* LEFT SECTION */}
        <div className={styles.navLeft}>
          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* BRAND */}
          <div className={styles.navBrand}>
            <div className={styles.navBrandIcon}>R</div>

            <div className={styles.brandText}>
              <span className={styles.navBrandName}>
                Ristourne Dashboard
              </span>

              <span className={styles.navBrandSub}>
                GOLOMBE Network
              </span>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${
                  pathname === item.href
                    ? styles.navLinkActive
                    : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className={styles.navRight}>
          <div className={`${styles.golombeMark} ${styles.noPrint}`}>
            <div className={styles.golombeRing}></div>
            GOLOMBE
          </div>

          <div
            className={styles.userMenu}
            ref={menuRef}
          >
            <button
              type="button"
              className={styles.navUserBtn}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <div
                className={styles.navAvatar}
                aria-hidden="true"
              >
                AD
              </div>

              <span className={styles.adminName}>
                Admin
              </span>
            </button>

            {open && (
              <div
                className={styles.dropdown}
                role="menu"
              >
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    AD
                  </div>

                  <div className={styles.dropdownText}>
                    <div className={styles.dropdownName}>
                      Admin
                    </div>

                    <div className={styles.dropdownSub}>
                      Signed in
                    </div>
                  </div>
                </div>

                <div
                  className={styles.dropdownDivider}
                />

                <button
                  type="button"
                  className={
                    styles.dropdownItemDanger
                  }
                  onClick={onLogout}
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className={styles.mobileMenu}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileLink} ${
                  pathname === item.href
                    ? styles.mobileLinkActive
                    : ""
                }`}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}