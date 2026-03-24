/**
 * encrypted-text.client.component.tsx — scramble-to-reveal text animation
 *
 * React port of Inspira UI's EncryptedText.vue (Vue/Nuxt, MIT licence).
 * Original: https://github.com/unovue/inspira-ui — adapted for React.
 * No Inspira UI package dependency — bespoke implementation.
 *
 * Algorithm:
 *  1. Text starts fully scrambled from a random charset (ABCDEF...!@#$%...)
 *  2. Every revealDelayMs, the next character from left is revealed (real char)
 *  3. Unrevealed characters randomly flip every flipDelayMs
 *  4. Spaces are always preserved (never scrambled)
 *
 * Replay:
 *  When `active` transitions false → true, animation resets and replays.
 *  Used in the hero section so the tagline re-encrypts when leaving S1 and
 *  decrypts again on return.
 *
 * Accessibility:
 *  A visually-hidden span contains the real text so screen readers always
 *  see the complete, correct string regardless of animation state.
 *  All animated character spans are aria-hidden.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface EncryptedTextProps {
	/** The text to reveal */
	text: string;
	/** When this flips false→true the animation replays */
	active?: boolean;
	/** Ms between each character reveal. Default: 50 */
	revealDelayMs?: number;
	/** Ms between random character flips for unrevealed chars. Default: 50 */
	flipDelayMs?: number;
	/** Character pool for scrambling */
	charset?: string;
	/** Class applied to encrypted (not yet revealed) characters */
	encryptedClassName?: string;
	/** Class applied to revealed characters */
	revealedClassName?: string;
	className?: string;
}

const DEFAULT_CHARSET =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function pickChar(charset: string): string {
	return charset.charAt(Math.floor(Math.random() * charset.length));
}

function makeScramble(text: string, charset: string): string[] {
	return text.split("").map((ch) => (ch === " " ? " " : pickChar(charset)));
}

export function EncryptedText({
	text,
	active = true,
	revealDelayMs = 50,
	flipDelayMs = 50,
	charset = DEFAULT_CHARSET,
	encryptedClassName,
	revealedClassName,
	className,
}: EncryptedTextProps) {
	const [revealCount, setRevealCount] = useState(0);
	const [scrambleChars, setScrambleChars] = useState<string[]>(() =>
		makeScramble(text, charset),
	);

	const rafRef = useRef<number | null>(null);
	const startTimeRef = useRef<number>(0);
	const lastFlipRef = useRef<number>(0);
	// Capture latest values in refs so the rAF closure always reads current props
	const revealDelayRef = useRef(revealDelayMs);
	const flipDelayRef = useRef(flipDelayMs);
	const charsetRef = useRef(charset);
	const textRef = useRef(text);
	revealDelayRef.current = revealDelayMs;
	flipDelayRef.current = flipDelayMs;
	charsetRef.current = charset;
	textRef.current = text;

	const stopAnimation = useCallback(() => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, []);

	const startAnimation = useCallback(() => {
		stopAnimation();
		startTimeRef.current = 0;
		lastFlipRef.current = 0;
		setRevealCount(0);
		setScrambleChars(makeScramble(textRef.current, charsetRef.current));

		const animate = (now: number) => {
			if (startTimeRef.current === 0) {
				startTimeRef.current = now;
				lastFlipRef.current = now;
			}

			const currentText = textRef.current;
			const elapsed = now - startTimeRef.current;
			const currentReveal = Math.min(
				currentText.length,
				Math.floor(elapsed / Math.max(1, revealDelayRef.current)),
			);
			setRevealCount(currentReveal);

			if (currentReveal >= currentText.length) {
				rafRef.current = null;
				return;
			}

			const timeSinceFlip = now - lastFlipRef.current;
			if (timeSinceFlip >= Math.max(0, flipDelayRef.current)) {
				setScrambleChars((prev) =>
					prev.map((ch, i) => {
						if (i < currentReveal) return ch;
						return currentText[i] === " " ? " " : pickChar(charsetRef.current);
					}),
				);
				lastFlipRef.current = now;
			}

			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);
	}, [stopAnimation]);

	// Track prev active to detect the false→true transition
	const prevActiveRef = useRef(active);
	useEffect(() => {
		const wasActive = prevActiveRef.current;
		prevActiveRef.current = active;

		if (active && !wasActive) {
			startAnimation();
		} else if (!active) {
			stopAnimation();
			setRevealCount(0);
			setScrambleChars(makeScramble(text, charset));
		}
	}, [active, text, charset, startAnimation, stopAnimation]);

	// Play once on mount
	useEffect(() => {
		if (active) startAnimation();
		return stopAnimation;
	}, [active, startAnimation, stopAnimation]);

	const chars = text.split("");

	return (
		<span className={className}>
			{/* Screen-reader only — always shows the real complete text */}
			<span className="sr-only">{text}</span>

			{/* Animated characters — hidden from screen readers */}
			<span aria-hidden="true">
				{chars.map((ch, i) => {
					const isRevealed = i < revealCount;
					const displayChar = isRevealed
						? ch
						: ch === " "
							? "\u00a0"
							: (scrambleChars[i] ?? pickChar(charset));

					return (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: stable by position
							key={i}
							className={isRevealed ? revealedClassName : encryptedClassName}
						>
							{displayChar}
						</span>
					);
				})}
			</span>
		</span>
	);
}
