let audioContext;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone({ frequency, duration = .12, type = 'sine', gain = .045, when = 0 }) {
  const context = getAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const start = context.currentTime + when;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + .015);
  volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(volume).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

export const playVaultPurchase = () => {
  tone({ frequency: 392, type: 'triangle', gain: .055 });
  tone({ frequency: 523, type: 'triangle', gain: .045, when: .08 });
  tone({ frequency: 784, type: 'sine', gain: .035, when: .16 });
};

export const playEquip = () => {
  tone({ frequency: 330, type: 'sine', gain: .04 });
  tone({ frequency: 660, type: 'sine', gain: .035, when: .1 });
};

export const playCoinCollection = () => {
  tone({ frequency: 660, type: 'square', gain: .035 });
  tone({ frequency: 990, type: 'square', gain: .025, when: .07 });
};

export const playXpCollection = () => {
  tone({ frequency: 440, type: 'triangle', gain: .04 });
  tone({ frequency: 554, type: 'triangle', gain: .04, when: .08 });
  tone({ frequency: 880, type: 'triangle', gain: .03, when: .16 });
};

export const playNotification = () => {
  tone({ frequency: 740, type: 'sine', gain: .03 });
  tone({ frequency: 988, type: 'sine', gain: .025, when: .09 });
};
