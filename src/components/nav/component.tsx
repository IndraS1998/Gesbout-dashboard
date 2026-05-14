import styles from "./component.module.css";

export default function Nav(){
    return(
        <nav className={`${styles.topnav} ${styles.noPrint}`}>
            <div className={styles.navBrand}>
              <div className={styles.navBrandIcon}>R</div>

              <div>
                <span className={styles.navBrandName}>
                  Ristourne Dashboard
                </span>

                <span className={styles.navBrandSub}>
                  GOLOMBE Network
                </span>
              </div>
            </div>

            <div className={styles.navRight}>
              <div className={`${styles.golombeMark} ${styles.noPrint}`}>
                <div className={styles.golombeRing}></div>
                GOLOMBE
              </div>

              <div className={styles.navUser}>
                <div className={styles.navAvatar}>AD</div>
                <span className={styles.adminName}>Admin</span>
              </div>
            </div>
          </nav>
    )
}