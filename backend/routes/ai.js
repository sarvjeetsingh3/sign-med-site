require('dotenv').config();
const router = require('express').Router();
const Groq   = require('groq-sdk');
const logger = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimit');

const AI_SYSTEM = `You are MEDI, a holographic AI medical assistant on the SignMed Learn platform. You are an expert in:
1. Medical allergies — symptoms, severity, triggers, emergency response
2. Medication side effects, uses, and safety tips
3. Sign language — ASL, BSL, ISL and Universal signs especially for medical emergencies
4. First aid and emergency procedures

Keep responses concise, clear and helpful. Use medical terminology but explain it simply.
Format responses with short paragraphs. Use ⚕ for medical tips, 🤟 for sign language tips, ⚠ for warnings.
Never diagnose — always recommend consulting a doctor for serious concerns.
You are part of a cyberpunk-themed educational platform — be informative but keep a slightly futuristic tone.`;

// POST /api/ai/chat
router.post('/chat', apiLimiter, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const safe = messages
      .filter(m => ['user','assistant'].includes(m.role) && typeof m.content === 'string')
      .slice(-20);

    if (!safe.length) {
      return res.status(400).json({ error: 'No valid messages provided.' });
    }

    // Initialize client inside route so dotenv is already loaded
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await client.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      messages:   [{ role: 'system', content: AI_SYSTEM }, ...safe],
      max_tokens: 1000,
    });

    const reply = response.choices?.[0]?.message?.content || 'Sorry, I could not process that.';
    logger.info(`AI chat response sent (${reply.length} chars)`);
    res.json({ reply });

  } catch (err) {
    logger.error(`AI chat error: ${err.message}`);
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

module.exports = router;