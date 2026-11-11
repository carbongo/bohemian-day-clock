/** A struck bell, synthesised: the partials of a church bell over one strike tone. */
const STRIKE_HZ = 196;
const PARTIALS: [ratio: number, gain: number, seconds: number][] = [
  [0.5, 0.45, 4.2],
  [1, 0.8, 3.2],
  [1.19, 0.5, 2.4],
  [1.5, 0.3, 1.8],
  [2, 0.55, 1.5],
  [2.51, 0.2, 1],
  [3.01, 0.14, 0.7],
];

let context: AudioContext | undefined;

/** Call from a key press or click: browsers only let sound start from one. */
export function primeBell() {
  try {
    context ??= new AudioContext();
    void context.resume();
  } catch {
    // No audio: the wait still ends on screen.
  }
}

export function ringBell(strikes = 3) {
  if (!context || context.state !== "running") {
    return;
  }

  const output = context.createGain();
  output.gain.value = 0.22;
  output.connect(context.destination);

  for (let strike = 0; strike < strikes; strike += 1) {
    const start = context.currentTime + strike * 1.6;

    for (const [ratio, gain, seconds] of PARTIALS) {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();

      oscillator.frequency.value = STRIKE_HZ * ratio;
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
      oscillator.connect(envelope).connect(output);
      oscillator.start(start);
      oscillator.stop(start + seconds);
    }
  }
}
