# MindCare AI: AI-Powered Mental Wellness Assistant with Multimodal Emotion Recognition

> **Major Engineering Final Year Project Dossier & Production Documentation**  
> **Affiliated Academic Discipline:** B.E. / B.Tech Computer Science & Engineering / Artificial Intelligence & Machine Learning

---

## 1. Project Overview & Problem Statement

Modern mental health tools frequently rely on either simplistic questionnaires or one-dimensional text chatbots that cannot perceive emotional nuance or multi-sensory affective behavior. Furthermore, individuals often exhibit emotional discrepancies (e.g., social smiling while feeling internal exhaustion or anxiety).

**MindCare AI** is an intelligent, compassionate full-stack mental wellness assistant featuring **Multimodal Emotion Recognition**. It ingests, analyzes, and synthesizes behavioral signals across **four distinct input channels**:
1. **Natural Language Text:** Deep semantic sentiment, contextual negation analysis, cognitive fatigue markers.
2. **Paralinguistic Voice:** Web Audio API fundamental pitch extraction (F0 autocorrelation), speaking cadence (WPM), pause frequencies, and signal RMS energy paired with transcribed verbal sentiment.
3. **Live Facial Video Feed:** Webcam capture analyzing morphological Facial Action Units (Ekman FACS: AU6/AU12 smile, AU4 brow furrow, AU15 depressor anguli oris) with non-diagnostic boundaries.
4. **Uploaded Facial Images:** Multi-format image inspection (JPG, PNG, WEBP) correlated with user contextual narratives.

It provides dynamic conversational therapy assistance with context retention, single-question follow-up inquiries, actionable wellness coping strategies, multilingual conversation (English, Kannada, Hindi, Tamil, Telugu, Malayalam, Spanish, French, German), longitudinal mood tracking, and downloadable PDF wellness reports.

---

## 2. System Architecture

```
                       ┌────────────────────────────────────────────────────────┐
                       │               CLIENT APPLICATION (React 19)            │
                       │  - HTML5 Video Canvas (Face & Action Units)            │
                       │  - Web Audio API (Microphone Pitch & Cadence Engine)   │
                       │  - Web Speech API (Multilingual Transcription & TTS)   │
                       │  - jsPDF Engine (Downloadable Wellness PDF Dossier)    │
                       └──────────────────────────┬─────────────────────────────┘
                                                  │ HTTP REST APIs / JSON / Base64
                                                  ▼
                       ┌────────────────────────────────────────────────────────┐
                       │             BACKEND SERVER (Express.js / Node)         │
                       │  - Session & Authentication (BcryptJS / Token Header)  │
                       │  - Crisis Detection Engine (112 / 14416 Triage)        │
                       │  - Hybrid Decision-Level Multimodal Fusion             │
                       └──────────────┬──────────────────────────┬──────────────┘
                                      │                          │
                                      ▼                          ▼
       ┌──────────────────────────────────────────────┐  ┌───────────────────────────────────┐
       │   FOUNDATION MODEL PIPELINE (Google AI Studio)│  │   LOCAL PERSISTENCE (SQLite WAL)  │
       │   - Model: gemini-3.8-flash                  │  │   - users, conversations, messages│
       │   - Affective Taxonomy: 16 Emotion Classes   │  │   - emotion_analyses, mood_history│
       │   - Multilingual Translation & Cultural Norms│  │   - user_activities (Breathing)   │
       └──────────────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 3. Project Folder Structure

```
.
├── .env.example                # API key & Cloud Run environment variables
├── index.html                  # HTML5 entry point with custom typography
├── metadata.json               # Applet capabilities & permissions (camera, microphone)
├── package.json                # Dependencies, scripts, and runtime packages
├── server.ts                   # Full-stack Express server with Vite middleware integration
├── server/
│   ├── db.ts                   # Better-SQLite3 database initialization & schema migrations
│   └── gemini.ts               # GoogleGenAI SDK integration (chat, text, voice, face, fusion)
├── src/
│   ├── App.tsx                 # Root component with 11-section sidebar navigation
│   ├── main.tsx                # React 19 entry point
│   ├── index.css               # Tailwind CSS & sleek animations
│   ├── types.ts                # TypeScript interfaces for emotions, sessions, and analytics
│   ├── context/
│   │   └── AuthContext.tsx     # Session management, authentication, theme & language state
│   ├── utils/
│   │   ├── audio.ts            # Web Audio API recording, pitch autocorrelation & TTS
│   │   ├── languages.ts        # Multilingual definitions & emotion color palettes
│   │   └── pdfReport.ts        # jsPDF wellness report generation
│   ├── components/
│   │   ├── Sidebar.tsx         # Responsive sidebar with 11 core sections
│   │   ├── Header.tsx          # Top bar with multilingual selector & quick tools
│   │   ├── EmotionBadge.tsx    # Emotion indicator badge component
│   │   ├── CrisisModal.tsx     # Emergency helpline directory & 5-4-3-2-1 grounding
│   │   ├── BreathingModal.tsx  # Interactive guided 4-7-8 and Box breathing visualizer
│   │   ├── AcademicVivaModal.tsx # Project viva presentation dossier & architecture Q&A
│   │   └── DisclaimerBanner.tsx# Ethical non-diagnostic disclaimer
│   └── pages/
│       ├── HomeDashboard.tsx   # Dashboard with 4 analysis launchers & quick check-in
│       ├── ChatAssistant.tsx   # Core conversational companion with context memory
│       ├── TextAnalysis.tsx    # Text emotion classification & negation parsing
│       ├── VoiceAnalysis.tsx   # Microphone recording & paralinguistic prosody
│       ├── FacialAnalysis.tsx  # Live webcam facial Action Unit recognition
│       ├── ImageUploadAnalysis.tsx # Photo upload & contextual narrative synthesis
│       ├── MultimodalFusion.tsx# Central hybrid decision-level fusion engine
│       ├── MoodTracker.tsx     # 1-10 Subjective mood continuum & factor tags
│       ├── EmotionHistory.tsx  # Historical audit log with modal drilldown
│       ├── AnalyticsReports.tsx# Frequency charts, trends & PDF report generation
│       ├── UserProfile.tsx     # Personal goals, GDPR data export & data wipe
│       └── SettingsPage.tsx    # Theme, TTS voice test & academic specifications
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite configuration
```

---

## 4. Key Modules & Features

### 1. Home Dashboard
- Welcome greeting with dynamic time-of-day greeting.
- 1-click emotional check-in with instant valence logging.
- Quick navigation tiles to the 4 input modes and the Multimodal Fusion Lab.
- Live summary counters (Total Analyses, Dominant Emotion, Conversations, Activities).

### 2. AI Conversational Wellness Assistant
- Powered by `gemini-3.8-flash` via the official `@google/genai` TypeScript SDK.
- Context retention across active multi-turn conversations.
- Asks exactly **one** meaningful follow-up question per turn.
- Generates 2–4 tailored, practical coping suggestions (e.g. 4-7-8 breathing, study recovery plans).
- Text-to-speech voice playback and speech-to-text microphone input.

### 3. Text Emotion Recognition
- Recognizes 16 emotional categories: *Happiness, Sadness, Anger, Fear, Surprise, Disgust, Neutral, Anxiety or worry, Stress, Frustration, Loneliness, Excitement, Confusion, Disappointment, Calmness, Emotional exhaustion*.
- Distinguishes model confidence (0.0 to 1.0) from psychological intensity (Low, Moderate, High).
- Handles negation syntax (e.g., "I am not happy") and cognitive fatigue indicators.

### 4. Voice Emotion Recognition
- Real-time oscilloscope / frequency bar audio visualizer via Web Audio API.
- Microphone stream capture and multi-format audio file upload (.wav, .mp3, .m4a, .webm).
- Dual-stream extraction: linguistic transcript + acoustic parameters (F0 pitch autocorrelation, tempo, pause frequency, RMS energy).
- Speech synthesis audio response playback.

### 5. Live Facial Expression Recognition
- Real-time HTML5 webcam stream capture.
- Analyzes morphological Facial Action Units (AU12 smile, AU4 brow furrow, AU15 depressor, eye widening).
- Clear cautious interpretation distinguishing visible outward movements from internal subjective feelings.
- Ground-truth calibration asking: *"Does this visible expression reflect how you actually feel inside?"*

### 6. Upload Facial Image Analysis
- Supports JPG, JPEG, PNG, and WEBP uploads with client validation.
- Includes pre-loaded demonstration presets for viva examination.
- Accepts user contextual narratives ("What was happening when this photo was taken?").

### 7. Multimodal Emotion Fusion Lab
- Central affective fusion engine combining Text, Voice, and Facial visual signals.
- Evaluates **Modality Agreement** (Aligned vs Divergent / Social Masking).
- Explains cross-modal synergies and provides unified wellness interventions.

### 8. Mood Tracker & Analytics
- Subjective 1–10 wellness continuum slider with descriptive emojis.
- Multi-select factor tags (College, Sleep, Work, Friends, Mindfulness).
- Visual trend bar charts and 16-emotion frequency distribution spectrums.

### 9. Downloadable PDF Wellness Report
- Generates professional, multi-page PDF documents via `jspdf`.
- Includes executive summary, recent analysis log, longitudinal mood history, tailored recommendations, and an ethical non-diagnostic notice.

### 10. Autonomous Crisis Support
- Continuous screening for suicidal thoughts, self-harm, or severe distress.
- Immediate interruption displaying 24/7 emergency helplines:
  - **India:** Tele-MANAS (14416 / 1800 891 4416), Emergency (112), Vandrevala (+91 9999 666 555)
  - **USA/Canada:** 988
  - **UK:** 111
  - **Global:** Befrienders Worldwide

---

## 5. Installation & Local Development Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Google AI Studio Gemini API Key (configured automatically in AI Studio via `GEMINI_API_KEY`)

### Setup Commands
```bash
# 1. Install all dependencies
npm install

# 2. Configure environment variables (if running outside AI Studio)
cp .env.example .env
# Set GEMINI_API_KEY="your-gemini-api-key"

# 3. Start development server (Node Express + Vite on port 3000)
npm run dev
```

### Production Build & Deployment
```bash
# 1. Compile frontend client bundle
npm run build

# 2. Start production server
npm start
```

---

## 6. How to Test Every Feature During Viva Demonstration

| Feature to Test | Step-by-Step Viva Action | Expected Result |
| :--- | :--- | :--- |
| **1. Text Emotion Analysis** | Navigate to *Text Emotion Analysis*, click the "Academic & Burnout" sample prompt, and click *Analyze*. | Returns *Frustration / Emotional Exhaustion*, *High* intensity, linguistic fatigue indicators, and study recovery suggestions. |
| **2. Conversational Memory** | Go to *AI Wellness Chat*, type: *"I am feeling very sad"*, then after AI asks why, reply: *"I failed my viva examination"*. | AI acknowledges the exam failure specifically, asks about worry vs preparation, and gives a 4-step recovery plan. |
| **3. Voice Prosody Analysis** | Go to *Voice Emotion Analysis*, click *Start Recording*, speak for 5 seconds, and click *Stop & Analyze*. | Live waveform animates, fundamental pitch (F0 in Hz) and pauses are extracted, and speech response can be played aloud via TTS. |
| **4. Live Facial Video** | Go to *Facial Emotion Analysis*, click *Start Camera*, align face in oval guide, and click *Capture & Analyze Expression*. | Detects visible Action Units (e.g. smile AU12 or neutral), displays confidence, and shows ethical interpretation. |
| **5. Social Masking Detection** | In *Multimodal Fusion Lab*, click the *Benchmark 2: Social Masking* preset and click *Execute Multimodal Fusion*. | Fuses smiling face with exhausted text, correctly outputting **"Modality: Divergent"** and diagnosing masked burnout. |
| **6. PDF Report Generation** | Go to *Analytics & Reports*, click *Download Wellness PDF Report*. | Downloads a formatted multi-page PDF document summarizing interactions, trends, and recommendations. |
| **7. Crisis Intervention** | In chat or text analysis, type: *"I want to hurt myself"*. | The system immediately halts normal chat and surfaces verified 24/7 helplines (112, 14416 Tele-MANAS, 988). |
| **8. Academic Viva Dossier** | Click *Project Viva Dossier* in the sidebar navigation. | Displays full block diagrams, hybrid fusion formulas, and examiner Q&A answers. |

---

## 7. Known Limitations & Future Work

1. **Facial Muscle Occlusion:** Extreme lighting conditions or partial camera occlusions can reduce landmark detection confidence.
2. **Audio Noise Ceiling:** High environmental acoustic noise can introduce variance into autocorrelation pitch calculations (mitigated by frequency thresholding between 65Hz and 450Hz).
3. **Future Extension:** Integration with wearable physiological telemetry (PPG photoplethysmography for heart rate variability / HRV) to supplement facial and acoustic prosodic streams.

---

## 8. License & Ethical Disclaimer

**MindCare AI** is engineered as an educational, reflective, and supportive wellness companion. It is strictly **non-diagnostic** and does not replace the clinical judgment of licensed psychiatrists or medical professionals.
