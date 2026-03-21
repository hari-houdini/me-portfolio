/**
 * audio-service.ts — Web Audio API ambient sound synthesis
 *
 * All audio is synthesised procedurally via the Web Audio API — no files
 * are loaded or bundled. This satisfies the PRD's "procedural-only assets"
 * constraint and avoids autoplay policy issues from file loading.
 *
 * Sound design:
 *  - Rain: filtered brown noise (low-pass filtered white noise with pink rolloff)
 *  - City hum: low sine oscillator (~60 Hz) mixed with sub-bass rumble (~35 Hz)
 *  - Both layers are crossfaded via gain nodes when the toggle is activated
 *
 * Lifecycle:
 *  AudioContext is created on first user interaction (toggle click), satisfying
 *  the browser autoplay policy. The context persists for the session duration.
 *
 * State machine:
 *  idle → playing → idle (toggle)
 *  idle → error (context creation fails — browser does not support Web Audio)
 */

export type AudioState = "idle" | "playing" | "error";

export interface AudioService {
	/** Current playback state */
	state: AudioState;
	/** Toggle audio on/off. Must be called from a user gesture. */
	toggle: () => Promise<void>;
	/** Immediately stop all audio and release resources */
	dispose: () => void;
}

// ---------------------------------------------------------------------------
// Brown noise generator
// ---------------------------------------------------------------------------

function createBrownNoise(ctx: AudioContext): AudioBufferSourceNode {
	const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
	const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
	const data = buffer.getChannelData(0);

	let lastOut = 0;
	for (let i = 0; i < bufferSize; i++) {
		const white = Math.random() * 2 - 1;
		// Brown noise via integration of white noise
		data[i] = (lastOut + 0.02 * white) / 1.02;
		lastOut = data[i];
		data[i] *= 3.5; // amplify to audible level
	}

	const source = ctx.createBufferSource();
	source.buffer = buffer;
	source.loop = true;
	return source;
}

// ---------------------------------------------------------------------------
// City hum oscillator
// ---------------------------------------------------------------------------

function createCityHum(ctx: AudioContext): OscillatorNode {
	const osc = ctx.createOscillator();
	osc.type = "sine";
	osc.frequency.value = 55; // low city rumble
	return osc;
}

// ---------------------------------------------------------------------------
// AudioService factory
// ---------------------------------------------------------------------------

export function createAudioService(): AudioService {
	let ctx: AudioContext | null = null;
	let masterGain: GainNode | null = null;
	let rainSource: AudioBufferSourceNode | null = null;
	let humSource: OscillatorNode | null = null;
	let currentState: AudioState = "idle";

	const service: AudioService = {
		get state() {
			return currentState;
		},

		async toggle() {
			if (currentState === "error") return;

			if (currentState === "playing") {
				// Fade out and suspend
				if (masterGain && ctx) {
					masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
					await new Promise<void>((resolve) => setTimeout(resolve, 500));
					await ctx.suspend();
				}
				currentState = "idle";
				return;
			}

			// idle → playing
			try {
				if (!ctx) {
					ctx = new AudioContext();
					masterGain = ctx.createGain();
					masterGain.gain.value = 0;
					masterGain.connect(ctx.destination);

					// Rain layer — filtered brown noise
					rainSource = createBrownNoise(ctx);
					const rainFilter = ctx.createBiquadFilter();
					rainFilter.type = "lowpass";
					rainFilter.frequency.value = 800;
					rainFilter.Q.value = 0.5;

					const rainGain = ctx.createGain();
					rainGain.gain.value = 0.15;

					rainSource.connect(rainFilter);
					rainFilter.connect(rainGain);
					rainGain.connect(masterGain);
					rainSource.start();

					// City hum layer
					humSource = createCityHum(ctx);
					const humGain = ctx.createGain();
					humGain.gain.value = 0.08;
					humSource.connect(humGain);
					humGain.connect(masterGain);
					humSource.start();
				} else {
					await ctx.resume();
				}

				// Fade in
				if (masterGain && ctx) {
					masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.0);
				}
				currentState = "playing";
			} catch {
				currentState = "error";
			}
		},

		dispose() {
			if (rainSource) {
				try {
					rainSource.stop();
				} catch {
					// Already stopped
				}
			}
			if (humSource) {
				try {
					humSource.stop();
				} catch {
					// Already stopped
				}
			}
			if (ctx) {
				ctx.close().catch(() => {});
			}
			ctx = null;
			masterGain = null;
			rainSource = null;
			humSource = null;
			currentState = "idle";
		},
	};

	return service;
}
