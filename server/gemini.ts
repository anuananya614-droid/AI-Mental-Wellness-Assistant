import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client lazily on the server side
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export const VALID_EMOTIONS = [
  'Happiness',
  'Sadness',
  'Anger',
  'Fear',
  'Surprise',
  'Disgust',
  'Neutral',
  'Anxiety or worry',
  'Stress',
  'Frustration',
  'Loneliness',
  'Excitement',
  'Confusion',
  'Disappointment',
  'Calmness',
  'Emotional exhaustion'
] as const;

export type EmotionCategory = typeof VALID_EMOTIONS[number];

// Multilingual Unicode script regexes
export const KANNADA_SCRIPT_REGEX = /[\u0C80-\u0CFF]/;
export const HINDI_SCRIPT_REGEX = /[\u0900-\u097F]/;
export const TELUGU_SCRIPT_REGEX = /[\u0C00-\u0C7F]/;

// Transliterated Latin script keywords
export const KANNADA_TRANSLIT_REGEX = /\b(nanage|nange|nanna|nimage|nimma|tumba|thumba|besara|bayavagide|bayavaguttide|bayavagtidhe|tension agtide|agtidhe|aagthide|beku|bedavagi|madodu|madbeku|yenu|yake|hege|hegidira|gothilla|gottilla|kashta|kasta|dukha|khushi|santhosha|parikshe|jeevana|ontithana|nirashe|saakagide)\b/i;

export const HINDI_TRANSLIT_REGEX = /\b(mujhe|mujhko|mera|meri|mere|tumhara|aapko|aapka|bahut|bohot|tanaav|pariksha|pareshan|pareshani|samajh|dukhi|udass|udas|khush|khushi|ghabrahat|darr|gussa|kya karu|lag raha|ho raha|ho rahi|samajh nahi)\b/i;

export const TELUGU_TRANSLIT_REGEX = /\b(naaku|naku|naa|nenu|meeku|miku|chala|aandholana|bhayanga|undhi|undi|badhaga|badha|parikshala|em cheyali|kashtamga|kashthamga|artham|manasuku|otthidi|othidi)\b/i;

export const KANNADA_EMOTION_MAP: Record<string, string> = {
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

export const HINDI_EMOTION_MAP: Record<string, string> = {
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

export const TELUGU_EMOTION_MAP: Record<string, string> = {
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

export function getLocalizedEmotionName(emotion: string, lang: string): string {
  if (lang === 'kn') return KANNADA_EMOTION_MAP[emotion] || emotion;
  if (lang === 'hi') return HINDI_EMOTION_MAP[emotion] || emotion;
  if (lang === 'te') return TELUGU_EMOTION_MAP[emotion] || emotion;
  return emotion;
}

export function detectLanguage(text: string): { lang: 'kn' | 'en' | 'hi' | 'te'; label: string } {
  if (!text) return { lang: 'en', label: 'English' };
  if (KANNADA_SCRIPT_REGEX.test(text) || KANNADA_TRANSLIT_REGEX.test(text)) {
    return { lang: 'kn', label: 'Kannada' };
  }
  if (HINDI_SCRIPT_REGEX.test(text) || HINDI_TRANSLIT_REGEX.test(text)) {
    return { lang: 'hi', label: 'Hindi' };
  }
  if (TELUGU_SCRIPT_REGEX.test(text) || TELUGU_TRANSLIT_REGEX.test(text)) {
    return { lang: 'te', label: 'Telugu' };
  }
  return { lang: 'en', label: 'English' };
}

// Crisis keywords and intent detection including Kannada, Hindi, Telugu script and transliterations
export function checkCrisisIntent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const patterns = [
    /suicid/i,
    /kill myself/i,
    /end my life/i,
    /want to die/i,
    /don't want to live/i,
    /better off dead/i,
    /hurt myself/i,
    /cut my wrist/i,
    /hang myself/i,
    /take all my pills/i,
    /no reason to live/i,
    /goodbye forever/i,
    /self.?harm/i,
    // Kannada crisis
    /ಆತ್ಮಹತ್ಯೆ|ಸಾಯಬೇಕು|ಸಾಯಲು ಇಷ್ಟ|ಜೀವನ ಮುಗಿಸ|ಬದುಕಲು ಇಷ್ಟವಿಲ್ಲ|ನನ್ನನ್ನು ಕೊಲ್ಲಲು/,
    /aatmahatye|saaybeku|saayabeku|jeevana mugis|badukalu ishtavilla|saayoke/i,
    // Hindi crisis
    /आत्महत्या|मरना चाहता|मरना चाहती|खुद को मारना|जीना नहीं चाहता|जीना नहीं चाहती|जान देना/,
    /aatmahatya|marna chahta|marna chahti|khud ko marna|jeena nahi/i,
    // Telugu crisis
    /ఆత్మహత్య|చావాలనుకుంటున్నాను|చనిపోవాలనిపిస్తుంది|బతకాలన లేదు|ప్రాణం తీస్కోవాలి/,
    /chavanukuntunnanu|chanipovalani|batakalanu|chavalanundi/i
  ];
  return patterns.some(p => p.test(lower));
}

export const CRISIS_RESPONSE = {
  isCrisis: true,
  message: "I hear how much pain you are carrying right now, and I care deeply about your safety. You do not have to carry this heavy burden alone. Please connect right away with people who are trained to help you through this very moment:",
  messageKannada: "ನಿಮ್ಮ ಮನಸ್ಸಿನ ನೋವು ಮತ್ತು ಸಂಕಟ ನನಗೆ ಅರ್ಥವಾಗುತ್ತಿದೆ. ನಿಮ್ಮ ಜೀವ ಮತ್ತು ಸುರಕ್ಷತೆ ಅತ್ಯಂತ ಅಮೂಲ್ಯ. ಈ ಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ನೀವು ಒಬ್ಬರೇ ಇಲ್ಲ. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಈ ಉಚಿತ ಸಹಾಯವಾಣಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ಸಹಾಯ ಪಡೆದುಕೊಳ್ಳಿ:",
  messageHindi: "मैं समझ सकता हूँ कि आप इस समय बहुत कठिन मानसिक दौर और तनाव से गुजर रहे हैं। आपकी सुरक्षा और जीवन हमारे लिए अत्यंत महत्वपूर्ण है। आप अकेले नहीं हैं। कृपया तुरंत इन हेल्पलाइन नंबरों पर संपर्क करें:",
  messageTelugu: "మీరు ప్రస్తుతం అనుభవిస్తున్న బాధ మరియు మనోవేదన నాకు అర్థమవుతోంది. మీ ప్రాణం మరియు భద్రత అత్యంత విలువైనవి. ఈ కష్ట సమయంలో మీరు ఒంటరిగా లేరు. దయచేసి వెంటనే ఈ ఉచిత హెల్ప్‌లైన్ నంబర్లను సంప్రదించండి:",
  helplines: [
    { country: "India (Tele-MANAS Govt)", name: "National Mental Health Helpline", number: "14416 / 1800 891 4416 (24/7 Free, Multilingual)" },
    { country: "India", name: "National Emergency Helpline", number: "112" },
    { country: "India (Bengaluru / Karnataka)", name: "SAHAI Helpline", number: "080 2549 7777" },
    { country: "India", name: "Vandrevala Foundation Helpline", number: "+91 9999 666 555 (24/7)" },
    { country: "United States / Canada", name: "Suicide & Crisis Lifeline", number: "988" },
    { country: "International", name: "Befrienders Worldwide", number: "befrienders.org" }
  ],
  suggestions: [
    "Stay with or call someone you trust right now.",
    "Breathe deeply: breathe in for 4 seconds, hold for 4, breathe out for 4.",
    "Put away any objects that could cause you harm.",
    "Call 112 (India) or 14416 (Tele-MANAS) immediately if you are in danger."
  ],
  suggestionsKannada: [
    "ಈ ಕ್ಷಣದಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬದವರು ಅಥವಾ ನಂಬಿಕಸ್ಥ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಇರಿ ಅಥವಾ ಕರೆ ಮಾಡಿ.",
    "4 ಸೆಕೆಂಡುಗಳ ಕಾಲ ದೀರ್ಘವಾಗಿ ಉಸಿರನ್ನು ಒಳಗೆ ತೆಗೆದುಕೊಂಡು ನಿಧಾನವಾಗಿ ಹೊರಬಿಡಿ.",
    "ನಿಮಗೆ ಹಾನಿ ಮಾಡಬಹುದಾದ ಯಾವುದೇ ವಸ್ತುಗಳಿಂದ ದೂರವಿರಿ.",
    "ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ತಕ್ಷಣವೇ 112 ಅಥವಾ 14416 (Tele-MANAS) ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ."
  ],
  suggestionsHindi: [
    "इस समय किसी भरोसेमंद दोस्त या परिवार के सदस्य के साथ रहें या उन्हें कॉल करें।",
    "4 सेकंड तक गहरी सांस अंदर लें, 4 सेकंड रोकें और धीरे-धीरे बाहर छोड़ें।",
    "खुद को नुकसान पहुंचाने वाली किसी भी चीज़ से तुरंत दूर रहें।",
    "आपातकालीन स्थिति में तुरंत 112 या 14416 (Tele-MANAS) पर कॉल करें।"
  ],
  suggestionsTelugu: [
    "ఈ సమయంలో మీ కుటుంబ సభ్యులు లేదా నమ్మకమైన స్నేహితుడితో ఉండండి లేదా కాల్ చేయండి.",
    "4 సెకన్ల పాటు లోతుగా శ్వాస తీసుకోండి మరియు నెమ్మదిగా వదలండి.",
    "మీకు హాని కలిగించే ఏవైనా వస్తువుల నుండి దూరంగా ఉండండి.",
    "అత్యవసర పరిస్థితిలో వెంటనే 112 లేదా 14416 (Tele-MANAS)కి కాల్ చేయండి."
  ]
};

/**
 * Resilient Gemini Generation with auto-fallback
 */
async function callGeminiWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseSchema?: any;
}) {
  const { contents, systemInstruction, responseSchema } = params;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please configure your API key in AI Studio.');
  }

  const baseConfig: any = {
    responseMimeType: 'application/json',
  };
  if (systemInstruction) baseConfig.systemInstruction = systemInstruction;
  if (responseSchema) baseConfig.responseSchema = responseSchema;

  const tryModel = async (modelName: string) => {
    return await getAiClient().models.generateContent({
      model: modelName,
      contents,
      config: baseConfig,
    });
  };

  const timeoutPromise = (ms: number) =>
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );

  try {
    const res = await Promise.race([tryModel('gemini-3.8-flash'), timeoutPromise(6000)]);
    return res;
  } catch (err: any) {
    console.warn('gemini-3.8-flash busy or timed out, switching to gemini-3.1-flash-lite:', err?.message || err);
    return await tryModel('gemini-3.1-flash-lite');
  }
}

export interface UnifiedConversationInput {
  inputType: 'text' | 'voice' | 'face_live' | 'face_upload' | 'multimodal';
  userMessage: string;
  detectedEmotion?: string;
  confidence?: number;
  intensity?: string;
  facialObservations?: string[];
  vocalObservations?: {
    avgPitchHz?: number;
    speakingRateWpm?: number;
    pauseCount?: number;
  };
  imageBase64?: string;
  mimeType?: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  preferredLanguage?: string;
  wellnessGoal?: string;
}

/**
 * Common Unified Conversation Engine
 * Handles Kannada, English, Hindi, and Telugu with Auto-Detection & Context Switching
 */
export async function processUnifiedConversation(input: UnifiedConversationInput) {
  const {
    inputType,
    userMessage,
    detectedEmotion,
    confidence,
    intensity,
    facialObservations,
    vocalObservations,
    imageBase64,
    mimeType = 'image/jpeg',
    history,
    preferredLanguage = 'auto',
    wellnessGoal = 'Mental wellbeing'
  } = input;

  // Detect language from text script or transliteration
  const isKnScript = KANNADA_SCRIPT_REGEX.test(userMessage);
  const isKnTrans = KANNADA_TRANSLIT_REGEX.test(userMessage);

  const isHiScript = HINDI_SCRIPT_REGEX.test(userMessage);
  const isHiTrans = HINDI_TRANSLIT_REGEX.test(userMessage);

  const isTeScript = TELUGU_SCRIPT_REGEX.test(userMessage);
  const isTeTrans = TELUGU_TRANSLIT_REGEX.test(userMessage);

  let activeLanguage = preferredLanguage;

  // Auto-detection logic if preferredLanguage is 'auto' or when input script overrides
  if (preferredLanguage === 'auto' || !preferredLanguage) {
    if (isKnScript || isKnTrans) activeLanguage = 'kn';
    else if (isHiScript || isHiTrans) activeLanguage = 'hi';
    else if (isTeScript || isTeTrans) activeLanguage = 'te';
    else activeLanguage = 'en';
  } else {
    // Explicit selection, but check if script clearly overrides
    if (isKnScript) activeLanguage = 'kn';
    else if (isHiScript) activeLanguage = 'hi';
    else if (isTeScript) activeLanguage = 'te';
    else {
      // Check explicit request to switch in message
      if (/\b(speak in english|in english|switch to english)\b/i.test(userMessage)) activeLanguage = 'en';
      else if (/\b(speak in kannada|kannada me|kannada nalli)\b/i.test(userMessage)) activeLanguage = 'kn';
      else if (/\b(speak in hindi|hindi me|hindi mein)\b/i.test(userMessage)) activeLanguage = 'hi';
      else if (/\b(speak in telugu|telugu lo)\b/i.test(userMessage)) activeLanguage = 'te';
    }
  }

  // Crisis check
  if (checkCrisisIntent(userMessage)) {
    let crisisMsg = CRISIS_RESPONSE.message;
    let crisisSugg = CRISIS_RESPONSE.suggestions;
    let crisisQuestion = 'Are you in a safe place right now? Please call 112 or 14416 (Tele-MANAS) immediately.';

    if (activeLanguage === 'kn') {
      crisisMsg = CRISIS_RESPONSE.messageKannada;
      crisisSugg = CRISIS_RESPONSE.suggestionsKannada;
      crisisQuestion = 'ನೀವು ಈ ಕ್ಷಣದಲ್ಲಿ ಸುರಕ್ಷಿತ ಜಾಗದಲ್ಲಿದ್ದೀರಾ? ದಯವಿಟ್ಟು 112 ಅಥವಾ 14416 (Tele-MANAS) ಗೆ ತಕ್ಷಣ ಕರೆ ಮಾಡಿ.';
    } else if (activeLanguage === 'hi') {
      crisisMsg = CRISIS_RESPONSE.messageHindi;
      crisisSugg = CRISIS_RESPONSE.suggestionsHindi;
      crisisQuestion = 'क्या आप इस समय किसी सुरक्षित स्थान पर हैं? कृपया तुरंत 112 या 14416 (Tele-MANAS) पर कॉल करें।';
    } else if (activeLanguage === 'te') {
      crisisMsg = CRISIS_RESPONSE.messageTelugu;
      crisisSugg = CRISIS_RESPONSE.suggestionsTelugu;
      crisisQuestion = 'మీరు ఈ క్షణంలో సురక్షితమైన ప్రదేశంలో ఉన్నారా? దయచేసి వెంటనే 112 లేదా 14416 (Tele-MANAS) కి కాల్ చేయండి.';
    }

    return {
      reply: crisisMsg,
      isCrisis: true,
      helplines: CRISIS_RESPONSE.helplines,
      detectedEmotion: 'Emotional exhaustion',
      detectedEmotionLocalized: getLocalizedEmotionName('Emotional exhaustion', activeLanguage),
      intensity: 'High',
      confidence: 0.99,
      followUpQuestion: crisisQuestion,
      suggestions: crisisSugg,
      detectedLanguage: activeLanguage
    };
  }

  // Construct language specific generation mandate
  let languageDirective = '';
  if (activeLanguage === 'kn') {
    languageDirective = `
CRITICAL KANNADA LANGUAGE MANDATE:
- The user is communicating in KANNADA (Kannada Script "ನನಗೆ ಆತಂಕವಾಗುತ್ತಿದೆ" or Kanglish transliteration "Nange exam tension agtide").
- UNDERSTAND KANGLISH & KANNADA SENTIMENT DEEPLY (ಆತಂಕ/tension -> Anxiety/Worry, ಬೇಸರ/besara -> Sadness, ಒತ್ತಡ/stress -> Stress, ಕೋಪ/sittu -> Anger, ಒಂಟಿತನ/ontithana -> Loneliness).
- GENERATE ALL RESPONSES IN KANNADA SCRIPT (ಕನ್ನಡ ಲಿಪಿ):
  * \`reply\`: Complete, warm, empathetic Kannada conversational response in KANNADA SCRIPT.
  * \`followUpQuestion\`: Exactly ONE reflective question in KANNADA SCRIPT.
  * \`suggestions\`: 2 to 4 practical wellness suggestions in KANNADA SCRIPT.`;
  } else if (activeLanguage === 'hi') {
    languageDirective = `
CRITICAL HINDI LANGUAGE MANDATE:
- The user is communicating in HINDI (Devanagari Script "मुझे चिंता हो रही है" or Hinglish transliteration "Mujhe exam ki tension ho rahi hai").
- UNDERSTAND HINGLISH & HINDI SENTIMENT DEEPLY (चिंता/tension -> Anxiety/Worry, उदासी/udas -> Sadness, तनाव/stress -> Stress, गुस्सा/gussa -> Anger, अकेलापन/akela -> Loneliness).
- GENERATE ALL RESPONSES IN HINDI DEVANAGARI SCRIPT (हिन्दी देवनागरी लिपि):
  * \`reply\`: Complete, warm, empathetic Hindi conversational response in DEVANAGARI SCRIPT.
  * \`followUpQuestion\`: Exactly ONE reflective question in DEVANAGARI SCRIPT.
  * \`suggestions\`: 2 to 4 practical wellness suggestions in DEVANAGARI SCRIPT.`;
  } else if (activeLanguage === 'te') {
    languageDirective = `
CRITICAL TELUGU LANGUAGE MANDATE:
- The user is communicating in TELUGU (Telugu Script "నాకు ఆందోళనగా ఉంది" or Telugish transliteration "Naaku exam tension gha undi").
- UNDERSTAND TELUGISH & TELUGU SENTIMENT DEEPLY (ఆందోళన/aandholana -> Anxiety/Worry, బాధ/badha -> Sadness, ఒత్తిడి/stress -> Stress, కోపం/kopam -> Anger, ఒంటరితనం/ontari -> Loneliness).
- GENERATE ALL RESPONSES IN TELUGU SCRIPT (తెలుగు లిపి):
  * \`reply\`: Complete, warm, empathetic Telugu conversational response in TELUGU SCRIPT.
  * \`followUpQuestion\`: Exactly ONE reflective question in TELUGU SCRIPT.
  * \`suggestions\`: 2 to 4 practical wellness suggestions in TELUGU SCRIPT.`;
  } else {
    languageDirective = `
ENGLISH LANGUAGE MANDATE:
- Generate complete, warm, empathetic response, one follow-up question, and coping suggestions in clear English.`;
  }

  const systemInstruction = `You are the AI-Powered Mental Wellness Assistant, an empathetic, highly intelligent, non-judgmental conversational wellness companion.

BEHAVIORAL PRINCIPLES:
1. Act like a real, context-aware AI assistant (similar to ChatGPT). Understand natural human language, including short ("I am sad"), long, or unclear messages.
2. Maintain active conversation context. Remember past turns and build upon what the user shared earlier.
3. NEVER repeat generic canned advice. Address the user's specific reason (e.g. failing an examination, friend betrayal, academic burnout, deadline anxiety).
4. Ask EXACTLY ONE thoughtful, relevant follow-up question per turn to help the user reflect or elaborate. Do not repeat questions already answered.
5. Provide 2 to 4 personalized, practical, constructive coping suggestions tailored to the current situation.
6. MULTIMODAL EVIDENCE: Incorporate facial Action Unit observations or vocal prosody cues naturally when provided.
7. MULTILINGUAL & TRANSLITERATION SUPPORT:
   - Target Language: ${activeLanguage}
   ${languageDirective}
   - CONVERSATION CONTEXT SWITCHING: If prior conversation turns were in another language and the user switches to ${activeLanguage} (or vice versa), seamlessly maintain all previously discussed context, topics, concerns, and history!
8. Strictly avoid medical or psychiatric diagnoses.
9. Return valid JSON matching the schema.`;

  // Build conversation history text
  const historyText = history
    .slice(-8)
    .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
    .join('\n');

  // Build multimodal sensory context
  const sensoryNotes: string[] = [];
  if (inputType === 'voice' && vocalObservations) {
    sensoryNotes.push(`Vocal prosody cues: Pitch ~${vocalObservations.avgPitchHz || 160}Hz, Cadence ~${vocalObservations.speakingRateWpm || 120}WPM, Pauses: ${vocalObservations.pauseCount || 0}`);
  }
  if ((inputType === 'face_live' || inputType === 'face_upload') && facialObservations?.length) {
    sensoryNotes.push(`Visible facial Action Units: ${facialObservations.join(', ')}`);
  }
  if (detectedEmotion) {
    sensoryNotes.push(`Preliminary signal detected: ${detectedEmotion} (Confidence: ${confidence || 0.8}, Intensity: ${intensity || 'Moderate'})`);
  }

  const promptText = `Conversation History:
${historyText || '(Beginning of conversation)'}

Latest Input:
- Input Type: ${inputType}
- User Message / Speech / Context: "${userMessage}"
${sensoryNotes.length > 0 ? `- Sensory Observations: ${sensoryNotes.join('; ')}` : ''}
- Target Language: ${activeLanguage}
- User Goal: ${wellnessGoal}

Analyze the emotional state in context and generate an empathetic response with one reflective follow-up question and tailored suggestions in the target language (${activeLanguage}).`;

  let contents: any;
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    contents = {
      parts: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64
          }
        },
        { text: promptText }
      ]
    };
  } else {
    contents = promptText;
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      reply: {
        type: Type.STRING,
        description: 'Empathetic, personalized conversational reply in the target language.'
      },
      detectedEmotion: {
        type: Type.STRING,
        description: 'Primary detected emotion from: Happiness, Sadness, Anger, Fear, Surprise, Disgust, Neutral, Anxiety or worry, Stress, Frustration, Loneliness, Excitement, Confusion, Disappointment, Calmness, Emotional exhaustion.'
      },
      intensity: {
        type: Type.STRING,
        description: 'Low, Moderate, or High.'
      },
      confidence: {
        type: Type.NUMBER,
        description: 'Model confidence between 0.50 and 0.99.'
      },
      followUpQuestion: {
        type: Type.STRING,
        description: 'One meaningful follow-up question in the target language.'
      },
      suggestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: '2 to 4 practical, actionable wellness recommendations in the target language.'
      }
    },
    required: ['reply', 'detectedEmotion', 'intensity', 'confidence', 'followUpQuestion', 'suggestions']
  };

  const response = await callGeminiWithFallback({
    contents,
    systemInstruction,
    responseSchema
  });

  const parsed = JSON.parse(response.text || '{}');
  const primEmotion = parsed.detectedEmotion || 'Neutral';

  const defaultReplies: Record<string, string> = {
    kn: 'ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಇದ್ದೇನೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ವಿಷಯವನ್ನು ಇನ್ನಷ್ಟು ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುವಿರಾ?',
    hi: 'मैं आपके साथ हूँ। क्या आप अपने दिल की बात और साझा करना चाहेंगे?',
    te: 'నేను మీతో ఉన్నాను. మీ మనస్సులో ఉన్న విషయం గురించి ఇంకా చెప్పాలనుకుంటున్నారా?',
    en: 'I am here with you. Would you like to share more about what is on your mind?'
  };

  const defaultQuestions: Record<string, string> = {
    kn: 'ಈ ವಿಷಯ ನಿಮ್ಮ ದಿನಚರಿಯ ಮೇಲೆ ಹೇಗೆ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ?',
    hi: 'यह स्थिति आपके दैनिक जीवन को कैसे प्रभावित कर रही है?',
    te: 'ఈ పరిస్థితి మీ రోజువారీ జీవితంపై ఎలాంటి ప్రభావం చూపుతోంది?',
    en: 'How has this situation been impacting your day?'
  };

  return {
    reply: parsed.reply || defaultReplies[activeLanguage] || defaultReplies.en,
    isCrisis: false,
    detectedEmotion: primEmotion,
    detectedEmotionLocalized: getLocalizedEmotionName(primEmotion, activeLanguage),
    intensity: parsed.intensity || 'Moderate',
    confidence: parsed.confidence || 0.85,
    followUpQuestion: parsed.followUpQuestion || defaultQuestions[activeLanguage] || defaultQuestions.en,
    suggestions: parsed.suggestions || [
      'Take 3 deep, grounding breaths.',
      'Take a short break to refresh your mind.'
    ],
    detectedLanguage: activeLanguage
  };
}

/**
 * Text Emotion Recognition Engine
 */
export async function analyzeTextEmotion(text: string, language: string = 'auto') {
  const d = detectLanguage(text);
  const activeLang = language === 'auto' ? d.lang : language;

  if (checkCrisisIntent(text)) {
    return {
      primaryEmotion: 'Emotional exhaustion',
      secondaryEmotions: ['Anxiety or worry', 'Sadness'],
      intensity: 'High',
      confidence: 0.99,
      isCrisis: true,
      explanation: 'Crisis indicators detected in input text.',
      indicators: ['Crisis or severe emotional pain expressions'],
      suggestions: CRISIS_RESPONSE.suggestions,
      followUpQuestion: 'Are you in a safe place right now? Please reach out to emergency helplines.'
    };
  }

  const prompt = `Analyze the emotional content of this user message: "${text}". Target Language: ${activeLang}.

Return JSON:
- primaryEmotion (one of the 16 standard categories)
- secondaryEmotions (array of 1-3 categories)
- intensity ("Low", "Moderate", "High")
- confidence (0.50 to 0.99)
- speechAnalysis (1 sentence summary)
- prosodicAnalysis (semantic tone description)
- explanation (1-2 sentences explanation in ${activeLang})
- indicators (array of observed emotional keywords or phrases)
- suggestions (array of 2-3 wellness suggestions in ${activeLang})
- followUpQuestion (1 question in ${activeLang})`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      primaryEmotion: { type: Type.STRING },
      secondaryEmotions: { type: Type.ARRAY, items: { type: Type.STRING } },
      intensity: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
      speechAnalysis: { type: Type.STRING },
      prosodicAnalysis: { type: Type.STRING },
      explanation: { type: Type.STRING },
      indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      followUpQuestion: { type: Type.STRING }
    },
    required: [
      'primaryEmotion',
      'secondaryEmotions',
      'intensity',
      'confidence',
      'speechAnalysis',
      'prosodicAnalysis',
      'explanation',
      'indicators',
      'suggestions',
      'followUpQuestion'
    ]
  };

  const response = await callGeminiWithFallback({
    contents: prompt,
    systemInstruction: "You are a senior affective computing researcher specializing in computational linguistics and multilingual emotion classification.",
    responseSchema
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    primaryEmotionLocalized: getLocalizedEmotionName(parsed.primaryEmotion || 'Neutral', activeLang),
    isCrisis: false
  };
}

/**
 * Voice Emotion Analysis Engine
 */
export async function analyzeVoiceEmotion(params: {
  transcription: string;
  audioFeatures?: any;
  language?: string;
}) {
  const { transcription, audioFeatures, language = 'auto' } = params;
  const d = detectLanguage(transcription);
  const activeLang = language === 'auto' ? d.lang : language;

  const prompt = `Analyze speech transcription and acoustic paralinguistics.
Transcription: "${transcription}"
Acoustic Cues: Pitch ~${audioFeatures?.avgPitchHz || 160}Hz, Cadence ~${audioFeatures?.speakingRateWpm || 120}WPM, Pauses: ${audioFeatures?.pauseCount || 0}.
Target Language: ${activeLang}.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      primaryEmotion: { type: Type.STRING },
      secondaryEmotions: { type: Type.ARRAY, items: { type: Type.STRING } },
      intensity: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
      speechAnalysis: { type: Type.STRING },
      prosodicAnalysis: { type: Type.STRING },
      explanation: { type: Type.STRING },
      indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      followUpQuestion: { type: Type.STRING }
    },
    required: [
      'primaryEmotion',
      'secondaryEmotions',
      'intensity',
      'confidence',
      'speechAnalysis',
      'prosodicAnalysis',
      'explanation',
      'indicators',
      'suggestions',
      'followUpQuestion'
    ]
  };

  const response = await callGeminiWithFallback({
    contents: prompt,
    systemInstruction: "You are an expert audio speech pathologist and paralinguistics researcher.",
    responseSchema
  });

  return {
    ...JSON.parse(response.text || '{}'),
    isCrisis: false
  };
}

/**
 * Facial Expression Analysis
 */
export async function analyzeFacialExpression(params: {
  imageBase64: string;
  mimeType?: string;
  userContext?: string;
  sourceType: 'live_webcam' | 'uploaded_image';
}) {
  const { imageBase64, mimeType = 'image/jpeg', userContext, sourceType } = params;
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `Analyze facial expressions in this image.
Source: ${sourceType === 'live_webcam' ? 'Live camera capture' : 'User uploaded photograph'}
${userContext ? `User context provided: "${userContext}"` : ''}

CRITICAL MANDATES:
1. NEVER attempt to identify the individual's identity or private profile.
2. DO NOT diagnose depression or clinical medical conditions from a face.
3. Visible facial movements (smiles, frowns) do not automatically prove inner emotion. Display cautious interpretation.
4. Classify visible expression category from the standard 16 emotions or "Uncertain / Insufficient data".
5. Detect face presence: faceDetected (boolean), qualityAssessment (string).
6. List visible morphological indicators (e.g. smile, furrowed brow).
7. Confidence: 0.50 to 0.95. Intensity: "Low", "Moderate", "High".
8. Ask a calibrating follow-up question and provide supportive suggestions.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      faceDetected: { type: Type.BOOLEAN },
      qualityAssessment: { type: Type.STRING },
      visibleExpression: { type: Type.STRING },
      secondaryPossibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
      intensity: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
      morphologicalIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
      cautiousInterpretation: { type: Type.STRING },
      calibratingQuestion: { type: Type.STRING },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: [
      'faceDetected',
      'qualityAssessment',
      'visibleExpression',
      'secondaryPossibilities',
      'intensity',
      'confidence',
      'morphologicalIndicators',
      'cautiousInterpretation',
      'calibratingQuestion',
      'suggestions'
    ]
  };

  const response = await callGeminiWithFallback({
    contents: {
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: prompt }
      ]
    },
    systemInstruction: "You are a computer vision facial morphological researcher.",
    responseSchema
  });

  return JSON.parse(response.text || '{}');
}

export interface MultimodalFusionInput {
  textAnalysis?: any;
  voiceAnalysis?: any;
  facialAnalysis?: any;
  userContext?: string;
}

export async function fuseMultimodalEmotions(input: MultimodalFusionInput) {
  const { textAnalysis, voiceAnalysis, facialAnalysis, userContext } = input;

  const activeModalities: string[] = [];
  if (textAnalysis?.primaryEmotion) activeModalities.push('Text');
  if (voiceAnalysis?.primaryEmotion) activeModalities.push('Voice');
  if (facialAnalysis?.visibleExpression) activeModalities.push('Facial');

  const prompt = `Fuse emotional signals from multiple input modalities into a unified multimodal emotion assessment.
Input Data:
- Text Signal: ${textAnalysis ? JSON.stringify(textAnalysis) : 'N/A'}
- Voice Signal: ${voiceAnalysis ? JSON.stringify(voiceAnalysis) : 'N/A'}
- Facial Signal: ${facialAnalysis ? JSON.stringify(facialAnalysis) : 'N/A'}
${userContext ? `- User Context: "${userContext}"` : ''}

Synthesize these inputs. If modalities conflict (e.g., smiling facial expression with sad/anxious text), explain the divergence sympathetically.

Return JSON:
- primaryEmotion: standard 16 emotion category
- secondaryEmotions: array of 1-3 categories
- intensity: "Low", "Moderate", "High"
- confidence: number between 0.50 and 0.99
- fusionExplanation: clear 2-3 sentence synthesis
- crossModalInsights: array of insights regarding congruence or masking
- suggestions: array of 2-4 wellness suggestions
- followUpQuestion: 1 thoughtful question`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      primaryEmotion: { type: Type.STRING },
      secondaryEmotions: { type: Type.ARRAY, items: { type: Type.STRING } },
      intensity: { type: Type.STRING },
      confidence: { type: Type.NUMBER },
      fusionExplanation: { type: Type.STRING },
      crossModalInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      followUpQuestion: { type: Type.STRING }
    },
    required: [
      'primaryEmotion',
      'secondaryEmotions',
      'intensity',
      'confidence',
      'fusionExplanation',
      'crossModalInsights',
      'suggestions',
      'followUpQuestion'
    ]
  };

  const response = await callGeminiWithFallback({
    contents: prompt,
    systemInstruction: "You are a multimodal affective computing synthesis engine.",
    responseSchema
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    activeModalities,
    primaryEmotionLocalized: getLocalizedEmotionName(parsed.primaryEmotion || 'Neutral', 'en')
  };
}
