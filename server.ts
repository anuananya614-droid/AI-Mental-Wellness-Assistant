import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './server/db.ts';
import {
  processUnifiedConversation,
  analyzeTextEmotion,
  analyzeVoiceEmotion,
  analyzeFacialExpression,
  fuseMultimodalEmotions
} from './server/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database schemas
initDatabase();

function resolvePort(): number {
  const portFlagIdx = process.argv.indexOf('--port');
  if (portFlagIdx !== -1 && process.argv[portFlagIdx + 1]) {
    const parsed = Number(process.argv[portFlagIdx + 1]);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.PORT &&
    process.env.NGINX_PORT &&
    process.env.PORT === process.env.NGINX_PORT
  ) {
    return Number(process.env.DEFAULT_APP_PORT || 3000);
  }
  return Number(process.env.PORT || process.env.DEFAULT_APP_PORT || 3000);
}

const app = express();
const PORT = resolvePort();

// Enable large payloads for base64 facial image frames
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to extract authenticated user ID from headers or fallback to guest
function getAuthUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId && headerUserId.trim().length > 0) {
    return headerUserId.trim();
  }
  return 'guest_user';
}

// ================= AUTHENTICATION & USER ROUTES =================

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, preferred_language = 'en', wellness_goal = 'Mental wellbeing' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, preferred_language, theme, wellness_goal, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name || '', email.toLowerCase(), password_hash, preferred_language, 'light', wellness_goal, now);

    const user = db.prepare('SELECT id, name, email, preferred_language, theme, wellness_goal, created_at FROM users WHERE id = ?').get(id);
    return res.json({ user, token: id });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      preferred_language: user.preferred_language,
      theme: user.theme,
      wellness_goal: user.wellness_goal,
      created_at: user.created_at
    };
    return res.json({ user: safeUser, token: user.id });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    let user = db.prepare('SELECT id, name, email, preferred_language, theme, wellness_goal, created_at FROM users WHERE id = ?').get(userId);
    if (!user) {
      user = db.prepare('SELECT id, name, email, preferred_language, theme, wellness_goal, created_at FROM users WHERE id = ?').get('guest_user');
    }
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { name, preferred_language, theme, wellness_goal } = req.body;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          preferred_language = COALESCE(?, preferred_language),
          theme = COALESCE(?, theme),
          wellness_goal = COALESCE(?, wellness_goal)
      WHERE id = ?
    `).run(name, preferred_language, theme, wellness_goal, userId);

    const updated = db.prepare('SELECT id, name, email, preferred_language, theme, wellness_goal, created_at FROM users WHERE id = ?').get(userId);
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ================= UNIFIED CONVERSATION ASSISTANT =================

app.get('/api/chat/conversations', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const rows = db.prepare(`
      SELECT c.*,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT count(*) FROM messages WHERE conversation_id = c.id) as message_count
      FROM conversations c
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
    `).all(userId);
    return res.json({ conversations: rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/conversations', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { title = 'New Wellness Session', language = 'en' } = req.body;
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO conversations (id, user_id, title, language, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, title, language, now, now);

    const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
    return res.json({ conversation: conv });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/conversations/:id/messages', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { id } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages
      WHERE conversation_id = ? AND user_id = ?
      ORDER BY created_at ASC
    `).all(id, userId);

    const parsedMessages = messages.map((m: any) => ({
      ...m,
      suggestions: m.suggestions_json ? JSON.parse(m.suggestions_json) : [],
      multimodal_context: m.multimodal_context_json ? JSON.parse(m.multimodal_context_json) : null
    }));

    return res.json({ messages: parsedMessages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Common Unified Message Endpoint
 * Accepts typed text, voice transcriptions, live facial snapshots, or uploaded photos,
 * all feeding into the same conversational engine.
 */
app.post('/api/chat/message', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const {
      conversationId,
      message,
      inputType = 'text',
      detectedEmotion,
      confidence,
      intensity,
      facialObservations,
      vocalObservations,
      imageBase64,
      mimeType = 'image/jpeg',
      language = 'en'
    } = req.body;

    const textContent = (message || '').trim();
    if (!textContent && !imageBase64) {
      return res.status(400).json({ error: 'Please provide a message or an image to analyze.' });
    }

    let convId = conversationId;
    const now = new Date().toISOString();

    // If conversation doesn't exist, create one
    if (!convId) {
      convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const truncatedTitle = (textContent || 'Visual Emotion Analysis').slice(0, 36) + (textContent.length > 36 ? '...' : '');
      db.prepare(`
        INSERT INTO conversations (id, user_id, title, language, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(convId, userId, truncatedTitle, language, now, now);
    }

    // Save user message in conversation
    const userMsgId = `msg_${Date.now()}_u`;
    const userMultimodalMeta = {
      inputType,
      hasImage: Boolean(imageBase64),
      facialObservations,
      vocalObservations
    };

    db.prepare(`
      INSERT INTO messages (id, conversation_id, user_id, role, content, input_modality, multimodal_context_json, created_at)
      VALUES (?, ?, ?, 'user', ?, ?, ?, ?)
    `).run(
      userMsgId,
      convId,
      userId,
      textContent || '(Sent image for facial emotion analysis)',
      inputType,
      JSON.stringify(userMultimodalMeta),
      now
    );

    // Fetch prior messages for conversational memory
    const historyRows = db.prepare(`
      SELECT role, content FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
      LIMIT 12
    `).all(convId) as Array<{ role: 'user' | 'assistant'; content: string }>;

    // Get user preferences
    const user = db.prepare('SELECT wellness_goal, preferred_language FROM users WHERE id = ?').get(userId) as any;

    // Call unified Gemini conversation engine
    const aiResult = await processUnifiedConversation({
      inputType,
      userMessage: textContent,
      detectedEmotion,
      confidence,
      intensity,
      facialObservations,
      vocalObservations,
      imageBase64,
      mimeType,
      history: historyRows,
      preferredLanguage: language || user?.preferred_language || 'en',
      wellnessGoal: user?.wellness_goal || 'Stress Management'
    });

    const assistantMsgId = `msg_${Date.now()}_a`;
    const assistantNow = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (
        id, conversation_id, user_id, role, content,
        detected_emotion, intensity, confidence,
        follow_up_question, suggestions_json, input_modality, created_at
      ) VALUES (?, ?, ?, 'assistant', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assistantMsgId,
      convId,
      userId,
      aiResult.reply,
      aiResult.detectedEmotion,
      aiResult.intensity,
      aiResult.confidence,
      aiResult.followUpQuestion,
      JSON.stringify(aiResult.suggestions || []),
      inputType,
      assistantNow
    );

    // Also persist into emotion_analyses audit ledger
    const analysisId = `ana_${Date.now()}`;
    db.prepare(`
      INSERT INTO emotion_analyses (
        id, user_id, input_mode, primary_emotion, secondary_emotions_json,
        intensity, confidence, input_text_or_summary, explanation,
        indicators_json, suggestions_json, follow_up_question, language, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      analysisId,
      userId,
      inputType,
      aiResult.detectedEmotion,
      JSON.stringify([]),
      aiResult.intensity,
      aiResult.confidence,
      textContent || `Analysis via ${inputType}`,
      aiResult.reply.slice(0, 160) + '...',
      JSON.stringify(facialObservations || []),
      JSON.stringify(aiResult.suggestions || []),
      aiResult.followUpQuestion,
      language,
      assistantNow
    );

    // Update conversation timestamp
    db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(assistantNow, convId);

    return res.json({
      conversationId: convId,
      assistantMessage: {
        id: assistantMsgId,
        conversation_id: convId,
        role: 'assistant',
        content: aiResult.reply,
        detected_emotion: aiResult.detectedEmotion,
        detected_emotion_kannada: (aiResult as any).detectedEmotionKannada || (aiResult as any).detectedEmotionLocalized,
        detected_emotion_localized: (aiResult as any).detectedEmotionLocalized,
        detected_language: (aiResult as any).detectedLanguage || language,
        intensity: aiResult.intensity,
        confidence: aiResult.confidence,
        follow_up_question: aiResult.followUpQuestion,
        suggestions: aiResult.suggestions,
        isCrisis: aiResult.isCrisis,
        helplines: (aiResult as any).helplines,
        created_at: assistantNow
      }
    });
  } catch (err: any) {
    console.error('Unified conversation error:', err);
    return res.status(500).json({
      error: err.message || 'The AI assistant encountered a temporary issue. Please try again.'
    });
  }
});

app.delete('/api/chat/conversations/:id', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { id } = req.params;
    db.prepare('DELETE FROM messages WHERE conversation_id = ? AND user_id = ?').run(id, userId);
    db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?').run(id, userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Clear conversation messages
app.delete('/api/chat/conversations/:id/messages', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { id } = req.params;
    db.prepare('DELETE FROM messages WHERE conversation_id = ? AND user_id = ?').run(id, userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ================= INDIVIDUAL SENSORY ANALYSIS MODULES =================

// Voice Emotion Recognition
app.post('/api/analyze/voice', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { transcription, audioFeatures, language = 'en', saveToHistory = true } = req.body;

    if (!transcription || !transcription.trim()) {
      return res.status(400).json({ error: 'Audio transcription content is required.' });
    }

    const result = await analyzeVoiceEmotion({
      transcription: transcription.trim(),
      audioFeatures,
      language
    });

    const analysisId = `ana_${Date.now()}`;
    const now = new Date().toISOString();

    if (saveToHistory) {
      db.prepare(`
        INSERT INTO emotion_analyses (id, user_id, input_mode, primary_emotion, secondary_emotions_json, intensity, confidence, input_text_or_summary, explanation, indicators_json, suggestions_json, follow_up_question, language, created_at)
        VALUES (?, ?, 'voice', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        analysisId,
        userId,
        result.primaryEmotion,
        JSON.stringify(result.secondaryEmotions || []),
        result.intensity,
        result.confidence,
        transcription.trim(),
        result.explanation,
        JSON.stringify(result.indicators || []),
        JSON.stringify(result.suggestions || []),
        result.followUpQuestion,
        language,
        now
      );
    }

    return res.json({ id: analysisId, ...result });
  } catch (err: any) {
    console.error('Voice analysis API error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze voice emotion.' });
  }
});

// Facial Expression Recognition (Live Camera or Uploaded Image)
app.post('/api/analyze/facial', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { imageBase64, mimeType = 'image/jpeg', userContext, sourceType = 'live_webcam', saveToHistory = true } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    const result = await analyzeFacialExpression({
      imageBase64,
      mimeType,
      userContext,
      sourceType
    });

    const analysisId = `ana_${Date.now()}`;
    const now = new Date().toISOString();

    if (saveToHistory && result.faceDetected) {
      const modeKey = sourceType === 'live_webcam' ? 'face_live' : 'face_upload';
      db.prepare(`
        INSERT INTO emotion_analyses (id, user_id, input_mode, primary_emotion, secondary_emotions_json, intensity, confidence, input_text_or_summary, explanation, indicators_json, suggestions_json, follow_up_question, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en', ?)
      `).run(
        analysisId,
        userId,
        modeKey,
        result.visibleExpression,
        JSON.stringify(result.secondaryPossibilities || []),
        result.intensity,
        result.confidence,
        userContext ? `Facial context: "${userContext}"` : `Visible expression (${sourceType})`,
        result.cautiousInterpretation,
        JSON.stringify(result.visibleIndicators || []),
        JSON.stringify(result.supportiveSuggestions || []),
        result.followUpQuestion,
        now
      );
    }

    return res.json({ id: analysisId, ...result });
  } catch (err: any) {
    console.error('Facial analysis API error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze facial expression.' });
  }
});

// Multimodal Emotion Fusion
app.post('/api/analyze/multimodal', async (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { textAnalysis, voiceAnalysis, facialAnalysis, userContext, saveToHistory = true } = req.body;

    const result = await fuseMultimodalEmotions({
      textAnalysis,
      voiceAnalysis,
      facialAnalysis,
      userContext
    });

    const analysisId = `ana_${Date.now()}`;
    const now = new Date().toISOString();

    if (saveToHistory) {
      db.prepare(`
        INSERT INTO emotion_analyses (id, user_id, input_mode, primary_emotion, secondary_emotions_json, intensity, confidence, input_text_or_summary, explanation, indicators_json, suggestions_json, follow_up_question, language, created_at)
        VALUES (?, ?, 'multimodal', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en', ?)
      `).run(
        analysisId,
        userId,
        result.primaryEmotion,
        JSON.stringify(result.secondaryEmotions || []),
        result.intensity,
        result.confidence,
        `Multimodal Fusion: [${(result.activeModalities || []).join(', ')}]`,
        result.fusionExplanation,
        JSON.stringify(result.crossModalInsights || []),
        JSON.stringify(result.suggestions || []),
        result.followUpQuestion,
        now
      );
    }

    return res.json({ id: analysisId, ...result });
  } catch (err: any) {
    console.error('Multimodal fusion API error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fuse multimodal emotions.' });
  }
});

// ================= EMOTION HISTORY & MOOD TRACKER =================

app.get('/api/emotions/history', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { mode, limit = 50 } = req.query;

    let query = 'SELECT * FROM emotion_analyses WHERE user_id = ?';
    const params: any[] = [userId];

    if (mode && mode !== 'all') {
      query += ' AND input_mode = ?';
      params.push(mode);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const rows = db.prepare(query).all(...params);
    const parsed = rows.map((r: any) => ({
      ...r,
      secondary_emotions: r.secondary_emotions_json ? JSON.parse(r.secondary_emotions_json) : [],
      indicators: r.indicators_json ? JSON.parse(r.indicators_json) : [],
      suggestions: r.suggestions_json ? JSON.parse(r.suggestions_json) : []
    }));

    return res.json({ history: parsed });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/emotions/history/:id', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { id } = req.params;
    db.prepare('DELETE FROM emotion_analyses WHERE id = ? AND user_id = ?').run(id, userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/emotions/history', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    db.prepare('DELETE FROM emotion_analyses WHERE user_id = ?').run(userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Wellness Activities
app.get('/api/activities', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const rows = db.prepare('SELECT * FROM user_activities WHERE user_id = ? ORDER BY completed_at DESC LIMIT 30').all(userId);
    return res.json({ activities: rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities/log', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const { activity_type, title, duration_minutes = 5, notes = '' } = req.body;

    const id = `act_${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO user_activities (id, user_id, activity_type, title, duration_minutes, notes, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, activity_type, title, duration_minutes, notes, now);

    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ================= ANALYTICS & REPORTS =================

app.get('/api/analytics', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);

    const totalAnalyses = (db.prepare('SELECT count(*) as count FROM emotion_analyses WHERE user_id = ?').get(userId) as any)?.count || 0;
    const totalConversations = (db.prepare('SELECT count(*) as count FROM conversations WHERE user_id = ?').get(userId) as any)?.count || 0;
    const totalActivities = (db.prepare('SELECT count(*) as count FROM user_activities WHERE user_id = ?').get(userId) as any)?.count || 0;

    const topEmotionRow = db.prepare(`
      SELECT primary_emotion, count(*) as count
      FROM emotion_analyses
      WHERE user_id = ?
      GROUP BY primary_emotion
      ORDER BY count DESC
      LIMIT 1
    `).get(userId) as any;
    const dominantEmotion = topEmotionRow ? topEmotionRow.primary_emotion : 'Calmness';

    const emotionDist = db.prepare(`
      SELECT primary_emotion, count(*) as count
      FROM emotion_analyses
      WHERE user_id = ?
      GROUP BY primary_emotion
      ORDER BY count DESC
    `).all(userId) as Array<{ primary_emotion: string; count: number }>;

    const modalityDist = db.prepare(`
      SELECT input_mode, count(*) as count
      FROM emotion_analyses
      WHERE user_id = ?
      GROUP BY input_mode
    `).all(userId) as Array<{ input_mode: string; count: number }>;

    const intensityDist = db.prepare(`
      SELECT intensity, count(*) as count
      FROM emotion_analyses
      WHERE user_id = ?
      GROUP BY intensity
    `).all(userId) as Array<{ intensity: string; count: number }>;

    return res.json({
      summary: {
        totalAnalyses,
        totalConversations,
        totalActivities,
        dominantEmotion
      },
      emotionDistribution: emotionDist,
      modalityDistribution: modalityDist,
      intensityDistribution: intensityDist
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/report/data', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    const user = db.prepare('SELECT id, name, email, preferred_language, wellness_goal, created_at FROM users WHERE id = ?').get(userId);
    const analyses = db.prepare('SELECT * FROM emotion_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId);
    const activities = db.prepare('SELECT * FROM user_activities WHERE user_id = ? ORDER BY completed_at DESC LIMIT 20').all(userId);

    return res.json({
      user: user || { name: 'User', email: '' },
      analyses,
      activities,
      generatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete all user data
app.delete('/api/user/data', (req: Request, res: Response) => {
  try {
    const userId = getAuthUserId(req);
    db.prepare('DELETE FROM emotion_analyses WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM messages WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM conversations WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM user_activities WHERE user_id = ?').run(userId);
    return res.json({ success: true, message: 'All personal records cleared.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ================= VITE DEV / PROD INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: !disableHmr,
        ws: disableHmr ? (false as const) : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI-Powered Mental Wellness Assistant server listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server failed to listen:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
