// @vitest-environment jsdom

/**
 * audio.service.unit.test.ts
 *
 * Tests for the AudioService state machine.
 *
 * The service uses Tone.js (dynamically imported on first toggle). Tone is
 * fully mocked — no real AudioContext or Web Audio nodes are created.
 *
 * Root cause of previous failures (three separate issues):
 *   1. Arrow function implementations: Vitest v4 / @vitest/spy v4 throws
 *      "X is not a constructor" when calling `new mock()` if the
 *      implementation is an arrow function.
 *   2. mockReturnValue with new: Vitest v4 explicitly throws when
 *      mockReturnValue() is called with `new`.
 *   3. Vite SSR transform: Vite/esbuild converts `function() { return obj; }`
 *      to `() => obj` when the function body has no `this` reference. The
 *      resulting arrow function then hits issue (1) at runtime.
 *
 * Fix: use `function(this: any) { this.x = ...; }` for all constructor mocks.
 *   - Using `this` prevents esbuild from converting to an arrow function.
 *   - Assigning to `this` is standard constructor behaviour — Vitest's
 *     Reflect.construct() returns the new instance with those properties.
 *   - Each `new Tone.X()` call produces a fresh instance with its own
 *     vi.fn() mocks, so no cross-test bleed even with shared constructors.
 *
 * What is verified (observable external behaviour only):
 *   - State starts at "idle"
 *   - idle → playing when Tone initialises and Tone.start() resolves
 *   - Tone graph (Volume) constructed exactly 4× on first toggle
 *   - playing → idle on second toggle (after the 600ms master fade timeout)
 *   - Tone graph NOT reconstructed on subsequent idle → playing cycle
 *   - idle → error when Tone.start() rejects (e.g. autoplay blocked)
 *   - error state is terminal — further toggles are no-ops
 *   - dispose() resets state to idle and calls getTransport().stop()
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mock handles
// vi.hoisted() runs before module loading. Refs are available inside the
// vi.mock() factory AND in test body code below.
// ---------------------------------------------------------------------------

const { mockToneStart, mockTransportStop, MockVolume } = vi.hoisted(() => ({
	mockToneStart: vi.fn().mockResolvedValue(undefined),
	mockTransportStop: vi.fn(),
	/**
	 * Tracks Volume constructor calls (expect 4: masterVol + volS0-2).
	 * Uses a this-based function so Vite/esbuild cannot optimise it to
	 * an arrow function (which would break Vitest v4's new-call handling).
	 */
	MockVolume: vi.fn().mockImplementation(function (this: {
		volume: { rampTo: ReturnType<typeof vi.fn> };
		connect: ReturnType<typeof vi.fn>;
		toDestination: ReturnType<typeof vi.fn>;
		dispose: ReturnType<typeof vi.fn>;
	}) {
		this.volume = { rampTo: vi.fn() };
		this.connect = vi.fn().mockReturnThis();
		this.toDestination = vi.fn().mockReturnThis();
		this.dispose = vi.fn();
	}),
}));

// ---------------------------------------------------------------------------
// Tone.js module mock
// All constructor implementations use `this`-based assignment so Vite/esbuild
// cannot rewrite them as arrow functions.
// getTransport() / start are regular calls (not constructors) — mockReturnValue
// / mockResolvedValue are fine.
// ---------------------------------------------------------------------------

vi.mock("tone", () => {
	const mockTransport = {
		bpm: { value: 115 },
		state: "stopped",
		start: vi.fn(),
		pause: vi.fn(),
		stop: mockTransportStop,
	};

	return {
		Volume: MockVolume,

		// biome-ignore format: keep constructor mocks compact
		Reverb: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
		}),

		Filter: vi.fn().mockImplementation(function (
			this: Record<string, unknown>,
		) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
			this.frequency = { value: 0 };
			this.Q = { value: 0 };
		}),

		PolySynth: vi.fn().mockImplementation(function (
			this: Record<string, unknown>,
		) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
			this.triggerAttack = vi.fn();
		}),

		Synth: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
			this.triggerAttack = vi.fn();
			this.triggerAttackRelease = vi.fn();
		}),

		MembraneSynth: vi.fn().mockImplementation(function (
			this: Record<string, unknown>,
		) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
			this.triggerAttackRelease = vi.fn();
		}),

		// LFO.start() must return the instance so `new LFO({}).start()` yields
		// an object with .connect() available.
		LFO: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
			this.connect = vi.fn();
			this.start = vi.fn().mockReturnThis();
		}),

		FeedbackDelay: vi.fn().mockImplementation(function (
			this: Record<string, unknown>,
		) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
		}),

		Compressor: vi.fn().mockImplementation(function (
			this: Record<string, unknown>,
		) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
		}),

		Gain: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
			this.connect = vi.fn().mockReturnThis();
			this.dispose = vi.fn();
		}),

		Noise: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
			this.connect = vi.fn();
			this.start = vi.fn();
			this.dispose = vi.fn();
		}),

		Pattern: vi.fn().mockImplementation(function (
			this: Record<string, unknown>,
		) {
			this.start = vi.fn();
			this.stop = vi.fn();
			this.dispose = vi.fn();
			this.interval = "2n";
		}),

		Sequence: vi.fn().mockImplementation(function (
			this: Record<string, unknown>,
		) {
			this.start = vi.fn();
			this.stop = vi.fn();
			this.dispose = vi.fn();
		}),

		// Regular function calls (not constructors) — standard mock helpers apply
		start: mockToneStart,
		getTransport: vi.fn().mockReturnValue(mockTransport),
	};
});

// ---------------------------------------------------------------------------
// Module under test — imported AFTER vi.mock() is hoisted
// ---------------------------------------------------------------------------

import { createAudioService } from "../audio.service";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createAudioService: state machine", () => {
	beforeEach(() => {
		// Fake timers intercept the 600ms setTimeout in the playing→idle fade.
		// idle→playing has no setTimeout calls so fake timers are transparent.
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		// Resets call counts but NOT implementations, so mockToneStart still
		// resolves by default and MockVolume's this-based impl is preserved.
		vi.clearAllMocks();
	});

	// -------------------------------------------------------------------------
	// Initial state
	// -------------------------------------------------------------------------

	it("starts in idle state", () => {
		const service = createAudioService();
		expect(service.state).toBe("idle");
	});

	// -------------------------------------------------------------------------
	// idle → playing
	// -------------------------------------------------------------------------

	it("transitions to playing after first toggle", async () => {
		const service = createAudioService();
		await service.toggle();
		expect(service.state).toBe("playing");
	});

	it("initialises the Tone graph on first toggle", async () => {
		const service = createAudioService();

		expect(MockVolume).not.toHaveBeenCalled();
		expect(mockToneStart).not.toHaveBeenCalled();

		await service.toggle();

		// masterVol + volS0 + volS1 + volS2 = 4 Volume instances
		expect(MockVolume).toHaveBeenCalledTimes(4);
		// Tone.start() satisfies the browser autoplay policy
		expect(mockToneStart).toHaveBeenCalledTimes(1);
	});

	// -------------------------------------------------------------------------
	// playing → idle
	// -------------------------------------------------------------------------

	it("transitions back to idle on second toggle", async () => {
		const service = createAudioService();
		await service.toggle(); // idle → playing
		expect(service.state).toBe("playing");

		// playing→idle awaits setTimeout(resolve, 600). Start without awaiting,
		// advance fake timers to fire the timeout, then await the settled promise.
		const idlePromise = service.toggle();
		await vi.runAllTimersAsync();
		await idlePromise;

		expect(service.state).toBe("idle");
	});

	// -------------------------------------------------------------------------
	// Re-play cycle — Tone graph must NOT be reconstructed
	// -------------------------------------------------------------------------

	it("does not reinitialise the Tone graph on a second play cycle", async () => {
		const service = createAudioService();

		await service.toggle(); // idle → playing (Tone graph constructed)

		const idlePromise = service.toggle(); // playing → idle
		await vi.runAllTimersAsync();
		await idlePromise;

		const volumeCallsAfterFirstCycle = MockVolume.mock.calls.length;

		await service.toggle(); // idle → playing again (isInitialised guard fires)

		// No new Volume instances — count must be identical
		expect(MockVolume).toHaveBeenCalledTimes(volumeCallsAfterFirstCycle);
	});

	// -------------------------------------------------------------------------
	// Error state — autoplay blocked
	// -------------------------------------------------------------------------

	it("transitions to error state when Tone.start() rejects", async () => {
		mockToneStart.mockRejectedValueOnce(new Error("Autoplay blocked"));

		const service = createAudioService();
		await service.toggle();

		expect(service.state).toBe("error");
	});

	it("does nothing when toggled in error state", async () => {
		mockToneStart.mockRejectedValueOnce(new Error("Autoplay blocked"));

		const service = createAudioService();
		await service.toggle(); // → error
		await service.toggle(); // must be a no-op

		expect(service.state).toBe("error");
		// Tone.start() called exactly once — the failed first attempt only
		expect(mockToneStart).toHaveBeenCalledTimes(1);
	});

	// -------------------------------------------------------------------------
	// dispose()
	// -------------------------------------------------------------------------

	it("dispose resets state to idle", async () => {
		const service = createAudioService();
		await service.toggle();
		expect(service.state).toBe("playing");

		service.dispose();

		expect(service.state).toBe("idle");
	});

	it("dispose stops the Tone Transport", async () => {
		const service = createAudioService();
		await service.toggle();
		service.dispose();

		expect(mockTransportStop).toHaveBeenCalled();
	});
});
