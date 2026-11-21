import { LanguageOption } from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto / ಸ್ವಯಂಚಾಲಿತ / स्वयंचलित / స్వయంచాలక', speechCode: 'auto' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', speechCode: 'de-DE' },
];

export const KANNADA_EMOTION_LABELS: Record<string, string> = {
  'Happiness': 'ಖುಷಿ ಮತ್ತು ಸಂತೋಷ',
  'Calmness': 'ಶಾಂತತೆ ಮತ್ತು ನೆಮ್ಮದಿ',
  'Excitement': 'ಉತ್ಸಾಹ',
  'Sadness': 'ದುಃಖ ಮತ್ತು ಬೇಸರ',
  'Anxiety or worry': 'ಆತಂಕ ಮತ್ತು ಗಾಬರಿ',
  'Stress': 'ಮಾನಸಿಕ ಒತ್ತಡ',
  'Frustration': 'ಕಿರಿಕಿರಿ ಮತ್ತು ನಿರಾಶೆ',
  'Anger': 'ಕೋಪ ಮತ್ತು ಸಿಟ್ಟು',
  'Fear': 'ಭಯ',
  'Disappointment': 'ಭಂಗ ಮತ್ತು ನಿರಾಶೆ',
  'Loneliness': 'ಏಕಾಂಗಿತನ ಮತ್ತು ಒಂಟಿತನ',
  'Emotional exhaustion': 'ಮಾನಸಿಕ ದಣಿವು',
  'Confusion': 'ಗೊಂದಲ',
  'Surprise': 'ಆಶ್ಚರ್ಯ',
  'Disgust': 'ಅಸಹ್ಯ',
  'Neutral': 'ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ',
};

export const HINDI_EMOTION_LABELS: Record<string, string> = {
  'Happiness': 'खुशी और प्रसन्नता',
  'Calmness': 'शांत भाव और सुकून',
  'Excitement': 'उत्साह',
  'Sadness': 'दुख और उदासी',
  'Anxiety or worry': 'चिंता और घबराहट',
  'Stress': 'मानसिक तनाव',
  'Frustration': 'हताशा और चिड़चिड़ापन',
  'Anger': 'क्रोध और गुस्सा',
  'Fear': 'डर और भय',
  'Disappointment': 'निराशा',
  'Loneliness': 'अकेलापन',
  'Emotional exhaustion': 'मानसिक थकान',
  'Confusion': 'उलझन और भ्रम',
  'Surprise': 'आश्चर्य',
  'Disgust': 'घृणा',
  'Neutral': 'सामान्य स्थिति',
};

export const TELUGU_EMOTION_LABELS: Record<string, string> = {
  'Happiness': 'సంతోషం మరియు ఆనందం',
  'Calmness': 'ప్రశాంతత మరియు నిశ్శబ్దం',
  'Excitement': 'ఉత్సాహం',
  'Sadness': 'బాధ మరియు విచారం',
  'Anxiety or worry': 'ఆందోళన మరియు భయం',
  'Stress': 'మానసిక ఒత్తిడి',
  'Frustration': 'చిరాకు మరియు నిరాశ',
  'Anger': 'కోపం మరియు ఆగ్రహం',
  'Fear': 'భయం',
  'Disappointment': 'నిరాశ',
  'Loneliness': 'ఒంటరితనం',
  'Emotional exhaustion': 'మానసిక అలసట',
  'Confusion': 'అయోమయం',
  'Surprise': 'ఆశ్చర్యం',
  'Disgust': 'అసహ్యం',
  'Neutral': 'సాధారణ స్థితి',
};

export const EMOTION_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Happiness': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'Calmness': { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-500' },
  'Excitement': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  'Sadness': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  'Anxiety or worry': { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
  'Stress': { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  'Frustration': { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  'Anger': { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  'Fear': { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800', dot: 'bg-violet-500' },
  'Disappointment': { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
  'Loneliness': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700', dot: 'bg-slate-500' },
  'Emotional exhaustion': { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', text: 'text-fuchsia-700 dark:text-fuchsia-300', border: 'border-fuchsia-200 dark:border-fuchsia-800', dot: 'bg-fuchsia-500' },
  'Confusion': { bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  'Surprise': { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', dot: 'bg-cyan-500' },
  'Disgust': { bg: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-200 dark:border-lime-800', dot: 'bg-lime-500' },
  'Neutral': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-700', dot: 'bg-gray-400' },
};

export function getEmotionStyle(emotionName: string) {
  return EMOTION_COLORS[emotionName] || EMOTION_COLORS['Neutral'];
}

export function getLocalizedEmotionLabel(emotionName: string, lang: string = 'en'): string {
  if (lang === 'kn' && KANNADA_EMOTION_LABELS[emotionName]) {
    return KANNADA_EMOTION_LABELS[emotionName];
  }
  if (lang === 'hi' && HINDI_EMOTION_LABELS[emotionName]) {
    return HINDI_EMOTION_LABELS[emotionName];
  }
  if (lang === 'te' && TELUGU_EMOTION_LABELS[emotionName]) {
    return TELUGU_EMOTION_LABELS[emotionName];
  }
  return emotionName;
}

// Unicode script regexes
export const KANNADA_SCRIPT_REGEX = /[\u0C80-\u0CFF]/;
export const HINDI_SCRIPT_REGEX = /[\u0900-\u097F]/;
export const TELUGU_SCRIPT_REGEX = /[\u0C00-\u0C7F]/;

// Transliteration keyword lists
const KANNADA_TRANSLIT_KEYWORDS = [
  'nanage', 'nange', 'nanna', 'nimage', 'nimma', 'tumba', 'thumba', 'besara',
  'bayavagide', 'bayavagtidhe', 'tension agtide', 'agtidhe', 'aagthide', 'beku',
  'madodu', 'madbeku', 'yenu', 'yake', 'hege', 'gothilla', 'gottilla', 'kashta',
  'dukha', 'khushi', 'santhosha', 'parikshe', 'jeevana', 'ontithana', 'nirashe', 'saakagide'
];

const HINDI_TRANSLIT_KEYWORDS = [
  'mujhe', 'mujhko', 'mera', 'meri', 'mere', 'tumhara', 'aapko', 'aapka',
  'bahut', 'bohot', 'tanaav', 'pariksha', 'pareshan', 'pareshani', 'samajh',
  'dukhi', 'udass', 'udas', 'khush', 'khushi', 'ghabrahat', 'darr', 'gussa',
  'kya karu', 'lag raha', 'ho raha', 'ho rahi', 'samajh nahi'
];

const TELUGU_TRANSLIT_KEYWORDS = [
  'naaku', 'naku', 'naa', 'nenu', 'meeku', 'miku', 'chala', 'aandholana',
  'bhayanga', 'undhi', 'undi', 'badhaga', 'badha', 'parikshala', 'em cheyali',
  'kashtamga', 'kashthamga', 'artham', 'manasuku', 'otthidi', 'othidi'
];

export function detectLanguage(text: string): {
  lang: 'kn' | 'hi' | 'te' | 'en';
  type: 'script' | 'transliteration' | 'latin';
} {
  if (!text || !text.trim()) {
    return { lang: 'en', type: 'latin' };
  }

  // 1. Script detection
  if (KANNADA_SCRIPT_REGEX.test(text)) {
    return { lang: 'kn', type: 'script' };
  }
  if (HINDI_SCRIPT_REGEX.test(text)) {
    return { lang: 'hi', type: 'script' };
  }
  if (TELUGU_SCRIPT_REGEX.test(text)) {
    return { lang: 'te', type: 'script' };
  }

  // 2. Transliteration (Romanized) keyword detection
  const lower = text.toLowerCase();

  for (const kw of KANNADA_TRANSLIT_KEYWORDS) {
    if (lower.includes(kw)) {
      return { lang: 'kn', type: 'transliteration' };
    }
  }

  for (const kw of HINDI_TRANSLIT_KEYWORDS) {
    if (lower.includes(kw)) {
      return { lang: 'hi', type: 'transliteration' };
    }
  }

  for (const kw of TELUGU_TRANSLIT_KEYWORDS) {
    if (lower.includes(kw)) {
      return { lang: 'te', type: 'transliteration' };
    }
  }

  return { lang: 'en', type: 'latin' };
}

// Backward compatibility helper
export function detectKannada(text: string): {
  isKannada: boolean;
  type: 'script' | 'transliteration' | 'none';
} {
  const d = detectLanguage(text);
  if (d.lang === 'kn') {
    return { isKannada: true, type: d.type === 'script' ? 'script' : 'transliteration' };
  }
  return { isKannada: false, type: 'none' };
}

export const MULTILINGUAL_QUICK_PROMPTS = [
  {
    lang: 'kn',
    label: 'ಕನ್ನಡ (Kannada Script): ಪರೀಕ್ಷೆಯ ಆತಂಕ',
    text: 'ನನಗೆ ಪರೀಕ್ಷೆಯ ಬಗ್ಗೆ ತುಂಬಾ ಆತಂಕವಾಗುತ್ತಿದೆ, ಏನು ಓದಿದರೂ ಮರೆತುಹೋಗುತ್ತಿದೆ.',
    type: 'script'
  },
  {
    lang: 'kn',
    label: 'Kanglish: Exam Tension',
    text: 'Nange exam tension tumba agtide, yenu oodhadhru nenapige barthilla.',
    type: 'transliteration'
  },
  {
    lang: 'hi',
    label: 'हिन्दी (Hindi Script): परीक्षा तनाव',
    text: 'मुझे अपनी परीक्षा को लेकर बहुत तनाव महसूस हो रहा है और चिंता हो रही है।',
    type: 'script'
  },
  {
    lang: 'hi',
    label: 'Hinglish: Exam Stress',
    text: 'Mujhe exam ko lekar bohot pareshani aur tension ho rahi hai.',
    type: 'transliteration'
  },
  {
    lang: 'te',
    label: 'తెలుగు (Telugu Script): పరీక్షల ఆందోళన',
    text: 'నాకు రాబోయే పరీక్షల గురించి చాలా ఆందోళనగా మరియు భయంగా ఉంది.',
    type: 'script'
  },
  {
    lang: 'te',
    label: 'Telugish: Exam Anxiety',
    text: 'Naaku exams gurinchi chala aandholanaga undhi, em cheyalo artham kavadam ledu.',
    type: 'transliteration'
  },
  {
    lang: 'en',
    label: 'English: Academic Stress',
    text: 'I am feeling overwhelmed and stressed about my upcoming college exams.',
    type: 'latin'
  }
];

export const KANNADA_QUICK_PROMPTS = MULTILINGUAL_QUICK_PROMPTS.filter(p => p.lang === 'kn');
