// Procedural Audio Synthesizer using Web Audio API
// Generates soft, cozy, romantic retro piano / music box chords and melody.

class CozyAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.sequenceId = null;
    this.bpm = 75;
    this.tempo = (60 / this.bpm) * 1000; // time per beat in ms

    // Beautiful romantic chord progression (Cmaj7 - Gadd4 - Am9 - Fmaj7)
    this.chords = [
      [48, 55, 60, 64, 67, 71], // Cmaj7: C3, G3, C4, E4, G4, B4
      [47, 55, 59, 62, 67, 71], // Gadd4/B: B2, G3, B3, D4, G4, B4
      [45, 52, 57, 60, 64, 67], // Am9: A2, E3, A3, C4, E4, G4
      [41, 48, 55, 57, 60, 64]  // Fmaj7: F2, C3, G3, A3, C4, E4
    ];

    // Melodic notes in C Major pentatonic / natural minor to generate sweet random highlights
    this.melodyNotes = [60, 62, 64, 67, 69, 72, 74, 76, 79]; 
    this.step = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime); // Soft volume
    this.masterGain.connect(this.ctx.destination);
  }

  // Convert MIDI note to Frequency
  noteToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // Create a cozy, retro piano/music box pluck
  playTone(note, time, duration = 1.5, type = 'sine', vel = 0.5) {
    if (!this.ctx) return;

    // Primary oscillator for fundamental frequency
    const osc = this.ctx.createOscillator();
    // Sub oscillator for warm low-end or harmonic highlight
    const subOsc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type; // 'triangle' or 'sine' works best for soft retro vibes
    osc.frequency.setValueAtTime(this.noteToFreq(note), time);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(this.noteToFreq(note) * 2, time); // Octave higher for chime feel

    // Custom ADSR envelope for cozy piano/pluck sound
    const now = time;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vel * 0.4, now + 0.05); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(vel * 0.15, now + 0.3); // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Long release

    osc.connect(gainNode);
    subOsc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(time);
    subOsc.start(time);

    osc.stop(time + duration);
    subOsc.stop(time + duration);
  }

  // Master play loop
  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const scheduleNextBeats = () => {
      if (!this.isPlaying) return;

      const scheduleAheadTime = 0.5; // schedule notes 500ms ahead
      let time = this.ctx.currentTime;

      // Arpeggiate chord notes & play melody
      const chordIndex = Math.floor(this.step / 8) % this.chords.length;
      const currentChord = this.chords[chordIndex];
      const beatIndex = this.step % 8;

      // Root note on 1st beat, chords rolling on 1, 3, 5, 7
      if (beatIndex === 0) {
        // Play deep root note (low velocity, warm triangle)
        this.playTone(currentChord[0], time, 3.0, 'triangle', 0.6);
        this.playTone(currentChord[1], time + 0.05, 2.5, 'sine', 0.4);
      } else if (beatIndex === 2) {
        // Mid voice
        this.playTone(currentChord[2], time, 2.0, 'sine', 0.4);
      } else if (beatIndex === 4) {
        // Higher voice
        this.playTone(currentChord[3], time, 2.0, 'sine', 0.4);
        this.playTone(currentChord[4], time + 0.05, 2.0, 'sine', 0.3);
      } else if (beatIndex === 6) {
        this.playTone(currentChord[5], time, 1.8, 'sine', 0.4);
      }

      // Add soft, sparkling melodies on top (pentatonic notes)
      // Plays randomly on offbeats to sound natural and relaxing
      if (Math.random() > 0.4 && beatIndex % 2 !== 0) {
        const randNote = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
        // Music box sound
        this.playTone(randNote, time, 1.2, 'sine', 0.25);
      }

      this.step++;
      
      // Schedule next call
      this.sequenceId = setTimeout(scheduleNextBeats, this.tempo / 2); // 8th notes
    };

    scheduleNextBeats();
  }

  stop() {
    this.isPlaying = false;
    if (this.sequenceId) {
      clearTimeout(this.sequenceId);
    }
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val * 0.15, this.ctx.currentTime);
    }
  }
}

const AudioEngine = new CozyAudioEngine();
export default AudioEngine;
