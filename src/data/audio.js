"use strict";

(() => {
  const DEFAULT_BGM_VOLUME = 1.00;
  const DEFAULT_SE_VOLUME = 1.00;
  const DEFAULT_MASTER_VOLUME = 1;
  const GESTURE_EVENTS = ["pointerdown", "keydown", "touchstart"];

  const SYNTH_SE = {
    confirm: { type: "triangle", notes: [660, 880], duration: 0.09, gap: 0.045, gain: 0.22 },
    cancel: { type: "triangle", notes: [420, 300], duration: 0.08, gap: 0.04, gain: 0.18 },
    attack: { type: "sawtooth", notes: [220, 150], duration: 0.07, gap: 0.02, gain: 0.14, noise: 0.12 },
    hit: { type: "square", notes: [180, 120], duration: 0.06, gap: 0.025, gain: 0.16, noise: 0.18 },
    damage: { type: "sawtooth", notes: [130, 90], duration: 0.11, gap: 0.03, gain: 0.18, noise: 0.22 },
    item: { type: "triangle", notes: [784, 988, 1175], duration: 0.07, gap: 0.045, gain: 0.2 },
    gold: { type: "triangle", notes: [880, 1320], duration: 0.06, gap: 0.04, gain: 0.16 },
    levelUp: { type: "triangle", notes: [523, 659, 784, 1046], duration: 0.08, gap: 0.05, gain: 0.22 },
    defeat: { type: "triangle", notes: [392, 523, 659], duration: 0.08, gap: 0.05, gain: 0.18 },
    victory: { type: "triangle", notes: [523, 659, 784, 1046, 1318], duration: 0.11, gap: 0.06, gain: 0.24 },
    boss: { type: "sawtooth", notes: [98, 73], duration: 0.18, gap: 0.04, gain: 0.18, noise: 0.25 },
  };

  function asSourceList(source) {
    if (!source) return [];
    if (Array.isArray(source)) return source.filter(Boolean);
    if (typeof source === "string") return [source];
    if (Array.isArray(source.src)) return source.src.filter(Boolean);
    if (typeof source.src === "string") return [source.src];
    return [];
  }

  function createNoopPromise() {
    return Promise.resolve(false);
  }

  function createAudioManager(config = {}) {
    const state = {
      unlocked: false,
      muted: Boolean(config.muted),
      masterVolume: config.masterVolume ?? DEFAULT_MASTER_VOLUME,
      bgmVolume: config.bgmVolume ?? DEFAULT_BGM_VOLUME,
      seVolume: config.seVolume ?? DEFAULT_SE_VOLUME,
      currentBgmKey: null,
      currentBgm: null,
      pendingBgm: null,
      bgmCache: new Map(),
      audioContext: null,
      unlockBound: false,
      bgmConfig: config.bgm || {},
      seConfig: config.se || {},
    };

    function effectiveVolume(kindVolume, localVolume = 1) {
      if (state.muted) return 0;
      return Math.max(0, Math.min(1, state.masterVolume * kindVolume * localVolume));
    }

    function getAudioContext() {
      if (!globalThis.AudioContext && !globalThis.webkitAudioContext) return null;
      if (!state.audioContext) {
        const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
        state.audioContext = new AudioContextClass();
      }
      return state.audioContext;
    }

    function getBgmEntry(key) {
      const entry = state.bgmConfig[key];
      if (!entry) return null;
      if (state.bgmCache.has(key)) return state.bgmCache.get(key);

      const srcList = asSourceList(entry);
      if (srcList.length === 0) return null;

      const audio = new Audio();
      audio.preload = entry.preload || "auto";
      audio.loop = entry.loop ?? true;
      audio.volume = 0;

      for (const src of srcList) {
        const source = document.createElement("source");
        source.src = src;
        if (src.endsWith(".ogg")) source.type = "audio/ogg";
        if (src.endsWith(".mp3")) source.type = "audio/mpeg";
        if (src.endsWith(".wav")) source.type = "audio/wav";
        audio.appendChild(source);
      }

      const cached = {
        audio,
        key,
        srcList,
        loop: entry.loop ?? true,
        volume: entry.volume ?? state.bgmVolume,
      };
      state.bgmCache.set(key, cached);
      return cached;
    }

    function preloadBgm(key) {
      const entry = getBgmEntry(key);
      if (!entry) return false;
      try {
        entry.audio.load();
        return true;
      } catch (error) {
        console.warn(`[audio] failed to preload bgm: ${key}`, error);
        return false;
      }
    }

    function applyBgmVolume(entry, localVolume = entry?.volume ?? 1) {
      if (!entry?.audio) return;
      entry.audio.volume = effectiveVolume(state.bgmVolume, localVolume);
    }

    function fadeAudio(audio, from, to, fadeMs = 0, onDone = null) {
      if (!audio) return;
      const start = performance.now();
      const duration = Math.max(0, fadeMs);
      if (duration <= 0) {
        audio.volume = to;
        onDone?.();
        return;
      }
      const step = () => {
        const rate = Math.min(1, (performance.now() - start) / duration);
        audio.volume = from + (to - from) * rate;
        if (rate < 1) requestAnimationFrame(step);
        else onDone?.();
      };
      requestAnimationFrame(step);
    }

    async function unlock() {
      if (state.unlocked) return true;
      state.unlocked = true;

      const context = getAudioContext();
      if (context?.state === "suspended") {
        try {
          await context.resume();
        } catch (error) {
          console.warn("[audio] failed to resume AudioContext", error);
        }
      }

      if (state.pendingBgm) {
        const { key, options } = state.pendingBgm;
        state.pendingBgm = null;
        await playBgm(key, options);
      }
      return true;
    }

    async function playBgm(key, options = {}) {
      if (!key) return false;
      if (!state.unlocked) {
        state.pendingBgm = { key, options };
        return false;
      }

      const next = getBgmEntry(key);
      if (!next) {
        console.warn(`[audio] bgm not found: ${key}`);
        return false;
      }

      const nextVolume = effectiveVolume(state.bgmVolume, options.volume ?? next.volume);
      if (state.currentBgmKey === key && state.currentBgm === next.audio) {
        next.audio.loop = options.loop ?? next.loop;
        applyBgmVolume(next, options.volume ?? next.volume);
        if (next.audio.paused) {
          try {
            await next.audio.play();
          } catch (error) {
            console.warn(`[audio] failed to resume bgm: ${key}`, error);
            return false;
          }
        }
        return true;
      }

      const previous = state.currentBgm;
      const previousVolume = previous?.volume ?? 0;
      state.currentBgmKey = key;
      state.currentBgm = next.audio;
      next.audio.loop = options.loop ?? next.loop;

      if (options.restart || next.audio.ended) next.audio.currentTime = 0;
      next.audio.volume = options.fadeMs ? 0 : nextVolume;

      try {
        await next.audio.play();
      } catch (error) {
        console.warn(`[audio] failed to play bgm: ${key}`, error);
        return false;
      }

      if (previous && previous !== next.audio) {
        fadeAudio(previous, previousVolume, 0, options.fadeMs ?? 0, () => {
          previous.pause();
          previous.currentTime = 0;
        });
      }
      if (options.fadeMs) fadeAudio(next.audio, 0, nextVolume, options.fadeMs);
      return true;
    }

    function pauseBgm(options = {}) {
      const audio = state.currentBgm;
      if (!audio || audio.paused) return false;
      const finish = () => audio.pause();
      fadeAudio(audio, audio.volume, 0, options.fadeMs ?? 0, finish);
      return true;
    }

    function stopBgm(options = {}) {
      const audio = state.currentBgm;
      if (!audio) return false;
      const finish = () => {
        audio.pause();
        audio.currentTime = 0;
        state.currentBgm = null;
        state.currentBgmKey = null;
      };
      fadeAudio(audio, audio.volume, 0, options.fadeMs ?? 0, finish);
      return true;
    }

    function playSe(name, options = {}) {
      if (state.muted || !state.unlocked) return false;

      const external = state.seConfig[name];
      if (external) {
        const src = Array.isArray(external) ? external[0] : external.src || external;
        if (src) {
          const audio = new Audio(src);
          audio.volume = effectiveVolume(state.seVolume, options.volume ?? external.volume ?? 1);
          audio.play().catch((error) => console.warn(`[audio] failed to play se: ${name}`, error));
          return true;
        }
      }

      const preset = SYNTH_SE[name];
      if (!preset) return false;
      const context = getAudioContext();
      if (!context) return false;

      const now = context.currentTime;
      const output = context.createGain();
      output.gain.value = effectiveVolume(state.seVolume, options.volume ?? preset.gain ?? 0.2);
      output.connect(context.destination);

      preset.notes.forEach((frequency, index) => {
        const start = now + index * (preset.duration + (preset.gap || 0));
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = preset.type || "triangle";
        osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(1, start + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, start + preset.duration);
        osc.connect(gain).connect(output);
        osc.start(start);
        osc.stop(start + preset.duration + 0.02);
      });

      if (preset.noise) {
        const length = Math.floor(context.sampleRate * 0.08);
        const buffer = context.createBuffer(1, length, context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * preset.noise;
        const source = context.createBufferSource();
        const noiseGain = context.createGain();
        noiseGain.gain.value = effectiveVolume(state.seVolume, 0.08);
        source.buffer = buffer;
        source.connect(noiseGain).connect(context.destination);
        source.start(now);
      }

      return true;
    }

    function setMasterVolume(value) {
      state.masterVolume = Math.max(0, Math.min(1, value));
      if (state.currentBgmKey) applyBgmVolume(getBgmEntry(state.currentBgmKey));
    }

    function setBgmVolume(value) {
      state.bgmVolume = Math.max(0, Math.min(1, value));
      if (state.currentBgmKey) applyBgmVolume(getBgmEntry(state.currentBgmKey));
    }

    function setSeVolume(value) {
      state.seVolume = Math.max(0, Math.min(1, value));
    }

    function setMuted(value) {
      state.muted = Boolean(value);
      if (state.currentBgmKey) applyBgmVolume(getBgmEntry(state.currentBgmKey));
    }

    function bindUnlockEvents(target = window, options = {}) {
      if (state.unlockBound) return;
      state.unlockBound = true;
      const onGesture = async () => {
        await unlock();
        if (options.bgmKey) playBgm(options.bgmKey, { fadeMs: options.fadeMs ?? 500 });
        options.onUnlock?.();
        for (const eventName of GESTURE_EVENTS) {
          target.removeEventListener(eventName, onGesture);
        }
      };
      for (const eventName of GESTURE_EVENTS) {
        target.addEventListener(eventName, onGesture, { passive: true });
      }
    }

    function status() {
      return {
        unlocked: state.unlocked,
        muted: state.muted,
        masterVolume: state.masterVolume,
        bgmVolume: state.bgmVolume,
        seVolume: state.seVolume,
        currentBgmKey: state.currentBgmKey,
        hasAudioContext: Boolean(state.audioContext),
      };
    }

    return {
      preloadBgm,
      playBgm,
      pauseBgm,
      stopBgm,
      playSe,
      unlock,
      bindUnlockEvents,
      setMasterVolume,
      setBgmVolume,
      setSeVolume,
      setMuted,
      status,
    };
  }

  function createNoopAudioManager() {
    return {
      preloadBgm: () => false,
      playBgm: createNoopPromise,
      pauseBgm: () => false,
      stopBgm: () => false,
      playSe: () => false,
      unlock: createNoopPromise,
      bindUnlockEvents: () => {},
      setMasterVolume: () => {},
      setBgmVolume: () => {},
      setSeVolume: () => {},
      setMuted: () => {},
      status: () => ({ unlocked: false, muted: true, currentBgmKey: null }),
    };
  }

  globalThis.DRAGON_HUNTER_AUDIO = {
    createAudioManager,
    createNoopAudioManager,
  };
})();
