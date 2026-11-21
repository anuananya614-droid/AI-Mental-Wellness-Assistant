export type EmotionName =
  | 'Happiness'
  | 'Sadness'
  | 'Anger'
  | 'Fear'
  | 'Surprise'
  | 'Disgust'
  | 'Neutral'
  | 'Anxiety or worry'
  | 'Stress'
  | 'Frustration'
  | 'Loneliness'
  | 'Excitement'
  | 'Confusion'
  | 'Disappointment'
  | 'Calmness'
  | 'Emotional exhaustion';

export type IntensityLevel = 'Low' | 'Moderate' | 'High';

export type ModalityType = 'text' | 'voice' | 'face_live' | 'face_upload' | 'multimodal';

export interface User {
  id: string;
  name: string;
  email: string;
  preferred_language: string;
  theme: 'light' | 'dark';
  wellness_goal: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  language: string;
  last_message?: string;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id?: string;
  role: 'user' | 'assistant';
  content: string;
  detected_emotion?: EmotionName | string;
  detected_emotion_kannada?: string;
  detected_emotion_localized?: string;
  detected_language?: string;
  intensity?: IntensityLevel;
  confidence?: number;
  follow_up_question?: string;
  suggestions?: string[];
  isCrisis?: boolean;
  helplines?: Array<{ country: string; name: string; number: string }>;
  created_at: string;
}

export interface EmotionAnalysisRecord {
  id: string;
  user_id?: string;
  input_mode: ModalityType;
  primary_emotion: EmotionName | string;
  secondary_emotions?: string[];
  intensity: IntensityLevel;
  confidence: number;
  input_text_or_summary: string;
  explanation: string;
  indicators: string[];
  suggestions: string[];
  follow_up_question?: string;
  language?: string;
  created_at: string;
}

export interface ActivityRecord {
  id: string;
  user_id: string;
  activity_type: 'breathing' | 'mindfulness' | 'gratitude' | 'relaxation' | 'reflection' | 'study_plan';
  title: string;
  duration_minutes: number;
  notes?: string;
  completed_at: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export interface AnalyticsData {
  summary: {
    totalAnalyses: number;
    totalConversations: number;
    totalActivities: number;
    dominantEmotion: string;
  };
  emotionDistribution: Array<{ primary_emotion: string; count: number }>;
  modalityDistribution: Array<{ input_mode: string; count: number }>;
  intensityDistribution: Array<{ intensity: string; count: number }>;
}
