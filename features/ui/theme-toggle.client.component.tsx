"use client";

/**
 * theme-toggle.client.component.tsx
 *
 * Accessible dark/light theme toggle button.
 *
 * - Reads initial state from `data-theme` on <html> (set before paint by FOUC script)
 * - Writes to localStorage key "theme" and updates `data-theme` on toggle
 * - aria-pressed reflects current state; aria-label describes next action
 */

import { useCallback, useEffect, useState } from "react";
import styles from "./theme-toggle.module.css";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
	if (typeof document === "undefined") return "dark";
	const attr = document.documentElement.getAttribute("data-theme");
	return attr === "light" ? "light" : "dark";
}

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	// Sync if another tab updates localStorage
	useEffect(() => {
		const handler = (e: StorageEvent) => {
			if (
				e.key === "theme" &&
				(e.newValue === "light" || e.newValue === "dark")
			) {
				setTheme(e.newValue);
				document.documentElement.setAttribute("data-theme", e.newValue);
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, []);

	const toggle = useCallback(() => {
		const next: Theme = theme === "dark" ? "light" : "dark";
		setTheme(next);
		document.documentElement.setAttribute("data-theme", next);
		try {
			localStorage.setItem("theme", next);
		} catch {
			// localStorage unavailable (private browsing, storage quota)
		}
	}, [theme]);

	const isDark = theme === "dark";

	return (
		<button
			type="button"
			className={styles.toggle}
			aria-pressed={isDark}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onClick={toggle}
		>
			<span className={styles.icon} aria-hidden="true">
				{isDark ? "☀" : "☾"}
			</span>
		</button>
	);
}
