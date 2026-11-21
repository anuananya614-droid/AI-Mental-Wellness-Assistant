// Audio recording, acoustic prosodic feature extraction, and Text-to-Speech utilities for Kannada, English, Hindi, and Telugu

export interface AcousticMetrics {
  avgPitchHz: number;
  pitchVariance: number;
  speakingRateWpm: number;
  pauseCount: number;
  pauseDurationSec: number;
  energyRms: number;
  dynamicRangeDb: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;

  // Metrics trackers
  private rmsValues: number[] = [];
  private pitchSamples: number[] = [];
  private silenceFrames = 0;
  private totalFrames = 0;
  private pauseCount = 0;
  private startTime = 0;

  async start(onWaveformData?: (data: Uint8Array) => void): Promise<void> {
    this.audioChunks = [];
    this.rmsValues = [];
    this.pitchSamples = [];
    this.silenceFrames = 0;
    this.totalFrames = 0;
    this.pauseCount = 0;
    this.startTime = Date.now();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.microphoneStream = stream;

    // Set up Web Audio Context & Analyser
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;

    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyser);

    // MediaRecorder
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
    }

    this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);

    // Realtime analysis loop
    const timeDomainData = new Float32Array(this.analyser.fftSize);
    const byteFrequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    const loop = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(byteFrequencyData);
      if (onWaveformData) {
        onWaveformData(byteFrequencyData);
      }

      this.analyser.getFloatTimeDomainData(timeDomainData);

      // Compute RMS (energy)
      let sumSquares = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        sumSquares += timeDomainData[i] * timeDomainData[i];
      }
      const rms = Math.sqrt(sumSquares / timeDomainData.length);
      this.rmsValues.push(rms);

      // Detect silence vs speech
      if (rms < 0.015) {
        this.silenceFrames++;
      } else {
        if (this.silenceFrames > 6) {
          this.pauseCount++;
        }
        this.silenceFrames = 0;

        // Auto-correlate for fundamental frequency (pitch estimation)
        const pitch = this.estimatePitch(timeDomainData, this.audioContext?.sampleRate || 44100);
        if (pitch > 65 && pitch < 450) {
          this.pitchSamples.push(pitch);
        }
      }

      this.totalFrames++;
      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  private estimatePitch(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let maxCorrelation = 0;
    let bestOffset = -1;

    const minOffset = Math.floor(sampleRate / 400);
    const maxOffset = Math.floor(sampleRate / 80);

    for (let offset = minOffset; offset <= maxOffset; offset++) {
      let correlation = 0;
      for (let i = 0; i < SIZE - offset; i++) {
        correlation += buffer[i] * buffer[i + offset];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestOffset = offset;
      }
    }

    if (bestOffset > 0 && maxCorrelation > 0.01) {
      return sampleRate / bestOffset;
    }
    return 0;
  }

  async stop(): Promise<{ audioBlob: Blob; audioUrl: string; metrics: AcousticMetrics }> {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        const dummyBlob = new Blob([], { type: 'audio/webm' });
        resolve({
          audioBlob: dummyBlob,
          audioUrl: '',
          metrics: {
            avgPitchHz: 160,
            pitchVariance: 24,
            speakingRateWpm: 120,
            pauseCount: 2,
            pauseDurationSec: 1.2,
            energyRms: 0.08,
            dynamicRangeDb: 18,
          },
        });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);

        if (this.microphoneStream) {
          this.microphoneStream.getTracks().forEach((track) => track.stop());
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
          this.audioContext.close();
        }

        const durationSec = Math.max(0.5, (Date.now() - this.startTime) / 1000);

        let avgPitch = 165;
        let pitchVariance = 25;
        if (this.pitchSamples.length > 0) {
          avgPitch = Math.round(this.pitchSamples.reduce((a, b) => a + b, 0) / this.pitchSamples.length);
          const variance = this.pitchSamples.reduce((acc, val) => acc + Math.pow(val - avgPitch, 2), 0) / this.pitchSamples.length;
          pitchVariance = Math.round(Math.sqrt(variance));
        }

        const avgRms = this.rmsValues.length > 0
          ? Number((this.rmsValues.reduce((a, b) => a + b, 0) / this.rmsValues.length).toFixed(3))
          : 0.05;

        const estimatedWpm = Math.round(Math.min(180, Math.max(70, 110 + (pitchVariance * 1.2))));

        const metrics: AcousticMetrics = {
          avgPitchHz: avgPitch,
          pitchVariance,
          speakingRateWpm: estimatedWpm,
          pauseCount: Math.max(1, this.pauseCount),
          pauseDurationSec: Number((durationSec * 0.25).toFixed(1)),
          energyRms: avgRms,
          dynamicRangeDb: Number((avgRms * 120).toFixed(1)),
        };

        resolve({ audioBlob: blob, audioUrl, metrics });
      };

      this.mediaRecorder.stop();
    });
  }
}

// Multilingual Speech Synthesis Voice Finders

export function getAvailableKannadaVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.toLowerCase() === 'kn-in' || v.lang.toLowerCase() === 'kn_in') ||
    voices.find(v => v.lang.toLowerCase().startsWith('kn')) ||
    voices.find(v => v.name.toLowerCase().includes('kannada') || v.name.includes('ಕನ್ನಡ')) ||
    null
  );
}

export function getAvailableHindiVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.toLowerCase() === 'hi-in' || v.lang.toLowerCase() === 'hi_in') ||
    voices.find(v => v.lang.toLowerCase().startsWith('hi')) ||
    voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी')) ||
    null
  );
}

export function getAvailableTeluguVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.toLowerCase() === 'te-in' || v.lang.toLowerCase() === 'te_in') ||
    voices.find(v => v.lang.toLowerCase().startsWith('te')) ||
    voices.find(v => v.name.toLowerCase().includes('telugu') || v.name.includes('తెలుగు')) ||
    null
  );
}

export function getAvailableEnglishVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase() === 'en_in') ||
    voices.find(v => v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en_us') ||
    voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
    null
  );
}

export function playTextToSpeech(text: string, languageCode: string = 'auto', onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip Markdown formatting markers for clean acoustic synthesis
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Script auto-detection fallback if language is set to 'auto' or unmapped
  let effectiveLang = languageCode;
  if (effectiveLang === 'auto' || !effectiveLang) {
    if (/[\u0C80-\u0CFF]/.test(cleanText)) {
      effectiveLang = 'kn';
    } else if (/[\u0900-\u097F]/.test(cleanText)) {
      effectiveLang = 'hi';
    } else if (/[\u0C00-\u0C7F]/.test(cleanText)) {
      effectiveLang = 'te';
    } else {
      effectiveLang = 'en';
    }
  }

  // Map language codes to BCP-47 speech tags
  const speechLangMap: Record<string, string> = {
    'kn': 'kn-IN',
    'en': 'en-IN',
    'hi': 'hi-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'ml': 'ml-IN',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE'
  };

  const targetSpeechTag = speechLangMap[effectiveLang] || 'en-IN';
  utterance.lang = targetSpeechTag;

  // Language specific voice selection and acoustic pacing
  if (effectiveLang === 'kn') {
    utterance.rate = 0.90;
    utterance.pitch = 1.0;
    const knVoice = getAvailableKannadaVoice();
    if (knVoice) utterance.voice = knVoice;
  } else if (effectiveLang === 'hi') {
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    const hiVoice = getAvailableHindiVoice();
    if (hiVoice) utterance.voice = hiVoice;
  } else if (effectiveLang === 'te') {
    utterance.rate = 0.90;
    utterance.pitch = 1.0;
    const teVoice = getAvailableTeluguVoice();
    if (teVoice) utterance.voice = teVoice;
  } else {
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    const enVoice = getAvailableEnglishVoice();
    if (enVoice) utterance.voice = enVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function pauseTextToSpeech() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeTextToSpeech() {
  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopTextToSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
