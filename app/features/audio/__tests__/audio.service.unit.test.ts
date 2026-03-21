// @vitest-environment jsdom

/**
 * audio-service.test.ts
 *
 * Tests for the AudioService state machine.
 * Verifies state transitions (idle → playing → idle) and error handling.
 *
 * The Web Audio API is available in jsdom (via the AudioContext mock).
 * We mock AudioContext to control its behaviour in tests without real audio.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAudioService } from "../audio.service";

// ---------------------------------------------------------------------------
// Web Audio API mock
// ---------------------------------------------------------------------------

const mockOscillatorStart = vi.fn();
const mockOscillatorStop = vi.fn();
const mockOscillatorConnect = vi.fn();
const mockSourceStart = vi.fn();
const mockSourceStop = vi.fn();
const mockSourceConnect = vi.fn();
const mockGainConnect = vi.fn();
const mockFilterConnect = vi.fn();
const mockGainValue = { value: 0, linearRampToValueAtTime: vi.fn() };
const mockFilterFrequency = { value: 0 };
const mockContextSuspend = vi.fn().mockResolvedValue(undefined);
const mockContextResume = vi.fn().mockResolvedValue(undefined);
const mockContextClose = vi.fn().mockResolvedValue(undefined);

function makeMockAudioContext() {
	return {
		currentTime: 0,
		sampleRate: 44100,
		destination: {},
		state: "suspended",
		createGain: vi.fn(() => ({
			gain: mockGainValue,
			connect: mockGainConnect,
		})),
		createBiquadFilter: vi.fn(() => ({
			type: "lowpass",
			frequency: mockFilterFrequency,
			Q: { value: 0 },
			connect: mockFilterConnect,
		})),
		createBufferSource: vi.fn(() => ({
			buffer: null,
			loop: false,
			connect: mockSourceConnect,
			start: mockSourceStart,
			stop: mockSourceStop,
		})),
		createBuffer: vi.fn(
			(_channels: number, length: number, sampleRate: number) => ({
				sampleRate,
				length,
				getChannelData: vi.fn(() => new Float32Array(length)),
			}),
		),
		createOscillator: vi.fn(() => ({
			type: "sine",
			frequency: { value: 0 },
			connect: mockOscillatorConnect,
			start: mockOscillatorStart,
			stop: mockOscillatorStop,
		})),
		suspend: mockContextSuspend,
		resume: mockContextResume,
		close: mockContextClose,
	};
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createAudioService: state machine", () => {
	let MockAudioContext: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		MockAudioContext = vi.fn().mockImplementation(makeMockAudioContext);
		vi.stubGlobal("AudioContext", MockAudioContext);
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it("starts in idle state", () => {
		const service = createAudioService();
		expect(service.state).toBe("idle");
	});

	it("transitions to playing after first toggle", async () => {
		const service = createAudioService();
		await service.toggle();
		expect(service.state).toBe("playing");
	});

	it("creates an AudioContext on first toggle", async () => {
		const service = createAudioService();
		await service.toggle();
		expect(MockAudioContext).toHaveBeenCalledTimes(1);
	});

	it("transitions back to idle on second toggle", async () => {
		const service = createAudioService();
		await service.toggle(); // idle → playing
		expect(service.state).toBe("playing");

		// toggle() playing→idle awaits a 500ms fade-out setTimeout.
		// Start the toggle without awaiting it, then advance fake timers
		// so the internal setTimeout fires, then await the resolved promise.
		const togglePromise = service.toggle();
		await vi.runAllTimersAsync();
		await togglePromise;
		expect(service.state).toBe("idle");
	});

	it("does not create a second AudioContext on second toggle", async () => {
		const service = createAudioService();
		await service.toggle(); // idle → playing (creates context)

		const idlePromise = service.toggle(); // playing → idle
		await vi.runAllTimersAsync();
		await idlePromise;

		await service.toggle(); // idle → playing (resumes context — no new AudioContext)
		expect(MockAudioContext).toHaveBeenCalledTimes(1);
		expect(mockContextResume).toHaveBeenCalledTimes(1);
	});

	it("transitions to error state when AudioContext throws", async () => {
		MockAudioContext = vi.fn().mockImplementation(() => {
			throw new Error("AudioContext not supported");
		});
		vi.stubGlobal("AudioContext", MockAudioContext);

		const service = createAudioService();
		await service.toggle();
		expect(service.state).toBe("error");
	});

	it("does nothing when toggled in error state", async () => {
		MockAudioContext = vi.fn().mockImplementation(() => {
			throw new Error("AudioContext not supported");
		});
		vi.stubGlobal("AudioContext", MockAudioContext);

		const service = createAudioService();
		await service.toggle(); // → error
		await service.toggle(); // should be no-op
		expect(service.state).toBe("error");
		// AudioContext constructor called exactly once
		expect(MockAudioContext).toHaveBeenCalledTimes(1);
	});

	it("dispose resets state to idle", async () => {
		const service = createAudioService();
		await service.toggle();
		expect(service.state).toBe("playing");
		service.dispose();
		expect(service.state).toBe("idle");
	});

	it("dispose calls AudioContext.close()", async () => {
		const service = createAudioService();
		await service.toggle();
		service.dispose();
		expect(mockContextClose).toHaveBeenCalled();
	});
});
