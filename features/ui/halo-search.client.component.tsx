"use client";

/**
 * halo-search.client.component.tsx
 *
 * Accessible search input with a glowing halo ring on focus.
 * Drop-in replacement for <input type="search">; forwards all standard
 * input props via forwardRef.
 */

import { forwardRef } from "react";
import styles from "./halo-search.module.css";

type HaloSearchProps = React.InputHTMLAttributes<HTMLInputElement>;

export const HaloSearch = forwardRef<HTMLInputElement, HaloSearchProps>(
	function HaloSearch(props, ref) {
		return (
			<div className={styles.wrapper}>
				<input
					ref={ref}
					type="search"
					{...props}
					className={`${styles.input} ${props.className ?? ""}`.trim()}
				/>
			</div>
		);
	},
);
