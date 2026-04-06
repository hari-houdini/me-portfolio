"use client";

import styles from "./aurora.module.css";

export function AuroraBackground() {
    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <div className={styles["bg-layer"]}></div>
            </div>
        </div>
    )
}
