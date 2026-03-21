/**
 * audio-toggle.tsx — accessible audio on/off toggle button
 *
 * The toggle is a button that creates the Web Audio context on first
 * activation (satisfying browser autoplay policy — user gesture required).
 *
 * States:
 *  idle    → button shows "Enable audio", plays ambient audio on click
 *  playing → button shows "Disable audio", stops audio on click
 *  error   → button is disabled with a tooltip explaining the issue
 *
 * Accessibility:
 *  - aria-pressed reflects the current toggle state
 *  - aria-label updates to describe the action that will be taken
 *  - Keyboard operable (native <button>)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { type AudioService, createAudioService } from "./audio-service";

export function AudioToggle() {
	const serviceRef = useRef<AudioService | null>(null);
	const [state, setState] = useState<"idle" | "playing" | "error">("idle");
	const [isPending, setIsPending] = useState(false);

	// Initialise the service once on mount
	useEffect(() => {
		serviceRef.current = createAudioService();
		return () => {
			serviceRef.current?.dispose();
		};
	}, []);

	const handleToggle = useCallback(async () => {
		const service = serviceRef.current;
		if (!service || isPending) return;

		setIsPending(true);
		try {
			await service.toggle();
			setState(service.state);
		} finally {
			setIsPending(false);
		}
	}, [isPending]);

	const isPlaying = state === "playing";
	const isError = state === "error";

	const label = isError
		? "Audio unavailable in this browser"
		: isPlaying
			? "Disable ambient audio"
			: "Enable ambient audio";

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={isError || isPending}
			aria-pressed={isPlaying}
			aria-label={label}
			title={label}
			className={[
				"fixed bottom-6 right-6 z-20",
				"flex items-center justify-center w-10 h-10 rounded-full",
				"border transition-colors duration-200",
				isPlaying
					? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)]"
					: "border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-muted)]",
				isError
					? "opacity-40 cursor-not-allowed"
					: "cursor-pointer hover:border-[var(--color-neon-cyan)]",
			].join(" ")}
		>
			{/* Accessible icon — speaker with/without wave */}
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
			>
				{isPlaying ? (
					<>
						{/* Speaker + sound waves */}
						<path
							d="M11 5L6 9H2v6h4l5 4V5z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinejoin="round"
						/>
						<path
							d="M15.54 8.46a5 5 0 0 1 0 7.07"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<path
							d="M19.07 4.93a10 10 0 0 1 0 14.14"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</>
				) : (
					<>
						{/* Speaker muted */}
						<path
							d="M11 5L6 9H2v6h4l5 4V5z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinejoin="round"
						/>
						<line
							x1="23"
							y1="9"
							x2="17"
							y2="15"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<line
							x1="17"
							y1="9"
							x2="23"
							y2="15"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</>
				)}
			</svg>
		</button>
	);
}
