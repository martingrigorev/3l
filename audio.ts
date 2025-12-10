// Helper to manage voices state
let voices: SpeechSynthesisVoice[] = [];
// Keep a reference to the current utterance to prevent garbage collection on some mobile browsers (iOS Safari)
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const initVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const load = () => {
    const vs = window.speechSynthesis.getVoices();
    if (vs.length > 0) {
      voices = vs;
    }
  };

  load();
  
  // Chrome/Android loads voices asynchronously
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = load;
  }
};

export const playSound = (type: 'grab' | 'drop' | 'rustle' | 'success' | 'fanfare') => {
  // Safe check for SSR or environments without AudioContext
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'grab' || type === 'drop') {
    // "Bul'k" - Water drop/bubble sound
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    
    // Frequency sweep down for a "bloop" effect
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
    
    // Volume envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.25);

  } else if (type === 'rustle') {
    // Rustling sound
    const bufferSize = ctx.sampleRate * 0.2; // 200ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    noise.connect(filter);
    filter.connect(gain);
    
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    
    noise.start(now);

  } else if (type === 'success') {
    // Pleasant major chord arpeggio (C Major: C, E, G)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const noteGain = ctx.createGain();
      noteGain.connect(ctx.destination);
      
      const startTime = now + (i * 0.05);
      
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      
      osc.connect(noteGain);
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  } else if (type === 'fanfare') {
    // Louder, celebratory fanfare with dual oscillators for brassy tone
    
    const playTone = (freq: number, startTime: number, duration: number, volume: number) => {
      // SAFETY CHECK: Ensure start time is never negative relative to context
      const safeStart = Math.max(0, startTime);
      
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; // Sawtooth for brass
      osc.frequency.value = freq;
      
      // Second oscillator for thickness/chorus effect (louder sound)
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.detune.value = 5; // Slight detune
      osc2.frequency.value = freq;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 3000;

      const noteGain = ctx.createGain();
      
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(ctx.destination);
      
      const attack = 0.05;
      const release = 0.1;
      
      const attackEnd = safeStart + attack;
      // Ensure release doesn't start before attack ends
      // Math.max guarantees we don't go backwards in time
      let releaseStart = safeStart + duration - release;
      if (releaseStart < attackEnd) {
          releaseStart = attackEnd;
      }
      
      const stopTime = safeStart + duration + 0.2; // Extra tail

      // Volume envelope
      noteGain.gain.setValueAtTime(0, safeStart);
      noteGain.gain.linearRampToValueAtTime(volume, attackEnd);
      noteGain.gain.setValueAtTime(volume, releaseStart);
      noteGain.gain.exponentialRampToValueAtTime(0.001, stopTime);
      
      osc.start(safeStart);
      osc.stop(stopTime);
      osc2.start(safeStart);
      osc2.stop(stopTime);
    };

    // Intro Notes (Dun-Dun-Dun) - Adjusted volume
    const noteDur = 0.18;
    // Decreased volume from 0.35 to 0.15
    const introVol = 0.15;
    playTone(523.25, now, noteDur, introVol); // C5
    playTone(659.25, now + 0.2, noteDur, introVol); // E5
    playTone(523.25, now + 0.4, noteDur, introVol); // C5

    // Big Final Chord (DAAAA!)
    const chordStart = now + 0.6;
    const chordDur = 2.5;
    // Decreased volume from 0.25 to 0.1 per note (since 4 notes play simultaneously)
    const chordVol = 0.1; 

    playTone(523.25, chordStart, chordDur, chordVol); // C5
    playTone(659.25, chordStart, chordDur, chordVol); // E5
    playTone(783.99, chordStart, chordDur, chordVol); // G5
    playTone(1046.50, chordStart, chordDur, chordVol); // C6
  }
};

export const speakText = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any currently playing speech to avoid overlap
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
  utterance.lang = 'ru-RU';
  utterance.rate = 0.9; 
  utterance.volume = 1.0; 

  // Ensure voices are loaded
  if (voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }

  // Try to find a Russian voice
  // We prioritize 'ru-RU', then any 'ru'. 
  // If none found, we rely on the browser's default for the language set above.
  const ruVoice = voices.find(v => v.lang === 'ru-RU') 
               || voices.find(v => v.lang.startsWith('ru'));
               
  if (ruVoice) {
    utterance.voice = ruVoice;
  }

  // CRITICAL: Save reference to global variable to prevent garbage collection
  // on iOS/Safari which stops speech prematurely or prevents it from starting.
  currentUtterance = utterance;
  
  utterance.onend = () => {
    currentUtterance = null;
  };
  
  utterance.onerror = (e) => {
    console.error("Speech synthesis error", e);
    currentUtterance = null;
  };

  window.speechSynthesis.speak(utterance);
};