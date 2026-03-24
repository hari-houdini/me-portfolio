/**
 * audio.service.ts — Tone.js section-specific ambient music synthesis
 *
 * All sound is synthesised procedurally via Tone.js (Web Audio API wrapper) —
 * no audio files are loaded or bundled. The portfolio has three distinct
 * ambient layers, one per scroll section, crossfaded as the user navigates.
 *
 * Sound design:
 *  Section 0 (Galaxy Angled): Ethereal drone — PolySynth pad playing Cmaj7
 *    with very slow attack/decay and deep reverb. Near-silence feel.
 *  Section 1 (Galaxy Top-Down): Meditative — same pad with a warmer Fmaj7
 *    layer added. Gentle melodic Pattern with slow arpeggio.
 *  Section 2 (Warp Tunnel): Electronic pulse — sub-bass kick, pulsing synth
 *    bassline at 115 BPM, high-passed noise layer for tension. Still ambient
 *    but rhythmically driven.
 *
 * Crossfade: section transitions use 1.5s Tone.Volume ramps.
 * Toggle: same control as before. When enabled, the current section's music
 *   plays. setSection(n) crossfades to the correct layer instantly.
 *
 * State machine: idle → playing → idle (toggle), idle → error (context fail)
 */

export type AudioState = "idle" | "playing" | "error";

export interface AudioService {
	/** Current playback state */
	state: AudioState;
	/** Toggle audio on/off. Must be called from a user gesture. */
	toggle: () => Promise<void>;
	/** Switch to the music for the given section (crossfades in 1.5s) */
	setSection: (section: 0 | 1 | 2) => void;
	/** Immediately stop all audio and release resources */
	dispose: () => void;
}

// ---------------------------------------------------------------------------
// Tone.js factory (lazy — only imported when user activates audio)
// ---------------------------------------------------------------------------

export function createAudioService(): AudioService {
	// All Tone.js objects are created lazily on first toggle() call.
	// This avoids touching AudioContext before a user gesture.
	let toneModule: typeof import("tone") | null = null;
	let isInitialised = false;
	let currentState: AudioState = "idle";
	let currentSection: 0 | 1 | 2 = 0;

	// Section volume nodes — crossfade targets
	let volS0: import("tone").Volume | null = null;
	let volS1: import("tone").Volume | null = null;
	let volS2: import("tone").Volume | null = null;

	// Sequencers / patterns that need cleanup on dispose
	let warpPattern: import("tone").Pattern<string> | null = null;
	let warpKickSeq: import("tone").Sequence | null = null;

	// Master volume for toggle fade
	let masterVol: import("tone").Volume | null = null;

	const SECTION_DB: [number, number, number] = [-20, -20, -18];
	const SILENT_DB = -Infinity;
	const CROSSFADE_TIME = 1.5;

	async function initTone() {
		if (isInitialised) return;

		const Tone = await import("tone");
		toneModule = Tone;

		// ---------- Master output chain ----------
		masterVol = new Tone.Volume(-12).toDestination();

		// ---------- Section 0: Galaxy Angled — Ethereal Cmaj7 pad ----------
		const reverbS0 = new Tone.Reverb({ decay: 10, wet: 0.85 }).connect(
			masterVol,
		);
		const filterS0 = new Tone.Filter(600, "lowpass").connect(reverbS0);
		volS0 = new Tone.Volume(SILENT_DB).connect(filterS0);

		const padS0 = new Tone.PolySynth(Tone.Synth, {
			oscillator: { type: "sine" },
			envelope: { attack: 5, decay: 0, sustain: 1, release: 4 },
			volume: -18,
		}).connect(volS0);

		// LFO on filter cutoff for slow evolution
		const lfoS0 = new Tone.LFO({
			frequency: "0.08",
			min: 300,
			max: 900,
		}).start();
		lfoS0.connect(filterS0.frequency);

		padS0.triggerAttack(["C3", "E3", "G3", "B3"]);

		// ---------- Section 1: Galaxy Top — Meditative Fmaj7 + melodic arp ----------
		const reverbS1 = new Tone.Reverb({ decay: 8, wet: 0.75 }).connect(
			masterVol,
		);
		const filterS1 = new Tone.Filter(900, "lowpass").connect(reverbS1);
		volS1 = new Tone.Volume(SILENT_DB).connect(filterS1);

		const padS1 = new Tone.PolySynth(Tone.Synth, {
			oscillator: { type: "triangle" },
			envelope: { attack: 4, decay: 0, sustain: 1, release: 3 },
			volume: -20,
		}).connect(volS1);

		padS1.triggerAttack(["F3", "A3", "C4", "E4"]);

		// Gentle melodic arpeggio
		const arpS1 = new Tone.Synth({
			oscillator: { type: "sine" },
			envelope: { attack: 0.5, decay: 1.5, sustain: 0.3, release: 2 },
			volume: -28,
		});
		const arpDelay = new Tone.FeedbackDelay("8n.", 0.35).connect(volS1);
		arpS1.connect(arpDelay);

		const arpNotes = ["C4", "E4", "G4", "B4", "C5"];
		let arpIdx = 0;
		warpPattern = new Tone.Pattern(
			() => {
				arpS1.triggerAttackRelease(
					arpNotes[arpIdx % arpNotes.length] ?? "C4",
					"4n",
				);
				arpIdx++;
			},
			arpNotes,
			"up",
		);
		warpPattern.interval = "2n";

		// ---------- Section 2: Warp Tunnel — Electronic pulse ----------
		const compS2 = new Tone.Compressor(-20, 4).connect(masterVol);
		const reverbS2 = new Tone.Reverb({ decay: 3, wet: 0.25 }).connect(compS2);
		volS2 = new Tone.Volume(SILENT_DB).connect(reverbS2);

		// Sub-bass kick
		const kick = new Tone.MembraneSynth({
			pitchDecay: 0.05,
			octaves: 5,
			envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
			volume: -12,
		}).connect(volS2);

		// Bassline synth
		const bass = new Tone.Synth({
			oscillator: { type: "sawtooth" },
			envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.5 },
			volume: -22,
		});
		const bassFilter = new Tone.Filter(400, "lowpass").connect(volS2);
		bass.connect(bassFilter);

		// High-pass noise for tension
		const noise = new Tone.Noise("pink");
		const noiseFilter = new Tone.Filter(3000, "highpass").connect(volS2);
		const noiseGain = new Tone.Gain(0.06).connect(noiseFilter);
		noise.connect(noiseGain);
		noise.start();

		Tone.getTransport().bpm.value = 115;

		warpKickSeq = new Tone.Sequence(
			(time, note) => {
				if (note === "kick") {
					kick.triggerAttackRelease("C1", "8n", time);
				} else {
					bass.triggerAttackRelease(note as string, "8n", time);
				}
			},
			["kick", "D1", "kick", "D1", "kick", "F1", "kick", "A1"],
			"8n",
		);

		isInitialised = true;

		// Apply current section volumes immediately
		applySection(currentSection, 0);
	}

	function applySection(section: 0 | 1 | 2, rampTime = CROSSFADE_TIME) {
		if (!isInitialised || !toneModule) return;

		const Tone = toneModule;

		const targets: [import("tone").Volume | null, number][] = [
			[volS0, section === 0 ? SECTION_DB[0] : SILENT_DB],
			[volS1, section === 1 ? SECTION_DB[1] : SILENT_DB],
			[volS2, section === 2 ? SECTION_DB[2] : SILENT_DB],
		];

		for (const [vol, targetDb] of targets) {
			if (vol) {
				vol.volume.rampTo(targetDb, rampTime);
			}
		}

		// Start/stop warp sequencers
		if (section === 2) {
			if (Tone.getTransport().state !== "started") {
				Tone.getTransport().start();
			}
			warpPattern?.start(0);
			warpKickSeq?.start(0);
		} else {
			warpPattern?.stop();
			warpKickSeq?.stop();
			// Don't stop Transport — it may be needed later
		}

		// Start Section 1 arp pattern
		if (section === 1) {
			if (Tone.getTransport().state !== "started") {
				Tone.getTransport().start();
			}
			warpPattern?.start(0);
		} else if (section !== 2) {
			warpPattern?.stop();
		}
	}

	const service: AudioService = {
		get state() {
			return currentState;
		},

		async toggle() {
			if (currentState === "error") return;

			if (currentState === "playing") {
				// Fade out master
				if (masterVol && toneModule) {
					masterVol.volume.rampTo(-80, 0.5);
					await new Promise<void>((resolve) => setTimeout(resolve, 600));
					toneModule.getTransport().pause();
				}
				currentState = "idle";
				return;
			}

			// idle → playing
			try {
				await initTone();

				if (toneModule) {
					await toneModule.start(); // satisfies browser autoplay policy
					masterVol?.volume.rampTo(-12, 1.0);
					applySection(currentSection, 0.5);
				}

				currentState = "playing";
			} catch {
				currentState = "error";
			}
		},

		setSection(section) {
			currentSection = section;
			if (currentState === "playing") {
				applySection(section, CROSSFADE_TIME);
			}
		},

		dispose() {
			try {
				toneModule?.getTransport().stop();
				warpPattern?.dispose();
				warpKickSeq?.dispose();
				volS0?.dispose();
				volS1?.dispose();
				volS2?.dispose();
				masterVol?.dispose();
			} catch {
				// Cleanup errors are non-fatal
			}
			toneModule = null;
			isInitialised = false;
			volS0 = null;
			volS1 = null;
			volS2 = null;
			warpPattern = null;
			warpKickSeq = null;
			masterVol = null;
			currentState = "idle";
		},
	};

	return service;
}
