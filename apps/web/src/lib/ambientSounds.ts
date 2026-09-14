"use client";

// Procedurally generated ambient sounds via the Web Audio API - no audio
// files, no licensing to worry about. Each sound is filtered/modulated
// noise; qualitatively distinct, not a scientifically accurate simulation.

export type SoundId = "regen" | "wellen" | "wind" | "rauschen";

export interface ActiveSound {
  stop: () => void;
  setVolume: (volume: number) => void;
}

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function createNoiseBuffer(ctx: AudioContext, seconds = 8): AudioBuffer {
  const length = seconds * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playSound(id: SoundId, initialVolume: number): ActiveSound {
  const ctx = getContext();
  if (ctx.state === "suspended") void ctx.resume();

  const source = ctx.createBufferSource();
  source.buffer = createNoiseBuffer(ctx);
  source.loop = true;

  const gain = ctx.createGain();
  let lfo: OscillatorNode | null = null;

  if (id === "rauschen") {
    gain.gain.value = initialVolume;
    source.connect(gain);
  } else if (id === "regen") {
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1000;
    gain.gain.value = initialVolume;
    source.connect(filter).connect(gain);
  } else if (id === "wind") {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    gain.gain.value = initialVolume;
    source.connect(filter).connect(gain);

    lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
  } else if (id === "wellen") {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    gain.gain.value = initialVolume * 0.5;
    source.connect(filter).connect(gain);

    lfo = ctx.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = initialVolume * 0.5;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();
  }

  gain.connect(ctx.destination);
  source.start();

  return {
    stop: () => {
      try {
        source.stop();
      } catch {
        // already stopped
      }
      lfo?.stop();
      source.disconnect();
      gain.disconnect();
    },
    setVolume: (volume: number) => {
      gain.gain.value = id === "wellen" ? volume * 0.5 : volume;
    },
  };
}
