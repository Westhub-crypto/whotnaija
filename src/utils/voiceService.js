/**
 * Voice announcement service using Web Speech API
 * Provides professional voice callouts for special card actions
 */

let voicesLoaded = false;
let selectedVoice = null;

function loadVoices() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) return resolve(null);

    let voices = synth.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    synth.onvoiceschanged = () => {
      voices = synth.getVoices();
      voicesLoaded = true;
      resolve(voices);
    };
  });
}

async function getBestVoice() {
  if (selectedVoice) return selectedVoice;

  const voices = await loadVoices();
  if (!voices) return null;

  // Prefer a professional-sounding English voice
  const preferredNames = ['Google UK English Male', 'Google UK English Female', 'Microsoft David', 'Microsoft Zira', 'Daniel', 'Karen'];

  for (const name of preferredNames) {
    const found = voices.find(v => v.name.includes(name));
    if (found) { selectedVoice = found; return found; }
  }

  // Fallback to any English voice
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  selectedVoice = englishVoice || voices[0];
  return selectedVoice;
}

export async function speak(text, options = {}) {
  if (!window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = await getBestVoice();
    if (voice) utterance.voice = voice;

    utterance.rate = options.rate || 1.05;
    utterance.pitch = options.pitch || 0.95;
    utterance.volume = options.volume ?? 1;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
  }
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// Pre-warm voices on load
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
}
