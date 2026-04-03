"use client";

/**
 * section-nav.client.component.tsx
 *
 * Fixed section navigation with Liquid Glass background.
 * Anchor links scroll to the four main page sections.
 *
 * Active state: tracks which section is in viewport via IntersectionObserver.
 * Lamp effect: radial-gradient glow follows the active/hovered link.
 */

import { useEffect, useRef, useState } from "react";
import { LiquidGlass } from "./liquid-glass.client.component";
import styles from "./section-nav.module.css";

const NAV_LINKS = [
	{ href: "#hero", label: "Home" },
	{ href: "#about", label: "About" },
	{ href: "#work", label: "Work" },
	{ href: "#contact", label: "Contact" },
] as const;

const SECTION_IDS = ["hero", "about", "work", "contact"] as const;

export function SectionNav() {
	const [activeSection, setActiveSection] = useState<string>("hero");
	const [lampStyle, setLampStyle] = useState<React.CSSProperties>({});
	const navRef = useRef<HTMLElement>(null);

	// Track active section via IntersectionObserver
	useEffect(() => {
		const observers: IntersectionObserver[] = [];

		for (const id of SECTION_IDS) {
			const el = document.getElementById(id);
			if (!el) continue;

			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						setActiveSection(id);
					}
				},
				{ threshold: 0.35 },
			);
			observer.observe(el);
			observers.push(observer);
		}

		return () => {
			for (const obs of observers) obs.disconnect();
		};
	}, []);

	// Move lamp glow to a link element
	const moveLampTo = (el: HTMLAnchorElement) => {
		const nav = navRef.current;
		if (!nav) return;
		const linkRect = el.getBoundingClientRect();
		const navRect = nav.getBoundingClientRect();
		const x = linkRect.left - navRect.left + linkRect.width / 2;
		const y = linkRect.top - navRect.top + linkRect.height / 2;
		setLampStyle({
			"--lamp-x": `${x}px`,
			"--lamp-y": `${y}px`,
			opacity: 1,
		} as React.CSSProperties);
	};

	const hideLamp = () => {
		setLampStyle((prev) => ({ ...prev, opacity: 0 }));
	};

	return (
		<nav ref={navRef} className={styles.nav} aria-label="Page sections">
			<LiquidGlass className={styles.glass}>
				{/* Lamp glow element */}
				<span className={styles.lamp} style={lampStyle} aria-hidden="true" />

				<ul className={styles.list}>
					{NAV_LINKS.map(({ href, label }) => {
						const sectionId = href.slice(1);
						const isActive = activeSection === sectionId;
						return (
							<li key={href}>
								<a
									href={href}
									className={`${styles.link} ${isActive ? styles.active : ""}`}
									aria-current={isActive ? "location" : undefined}
									onMouseEnter={(e) => moveLampTo(e.currentTarget)}
									onMouseLeave={hideLamp}
									onFocus={(e) => moveLampTo(e.currentTarget)}
									onBlur={hideLamp}
								>
									{label}
								</a>
							</li>
						);
					})}
				</ul>
			</LiquidGlass>
		</nav>
	);
}
