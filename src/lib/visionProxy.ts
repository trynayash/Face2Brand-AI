import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import type { Request, Response, Router } from 'express';
import type { CorsOptions, CorsOptionsDelegate } from 'cors';
import type { RateLimitRequestHandler } from 'express-rate-limit';
dotenv.config();

// PLACEHOLDER: Add your Google Cloud Vision API key to your .env file as GOOGLE_CLOUD_VISION_API_KEY
// or configure your service account credentials for production use.
// Example .env line:
// GOOGLE_CLOUD_VISION_API_KEY=your-google-cloud-vision-api-key

// CORS whitelist (replace with your production domains)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
const corsOptions: CorsOptions | CorsOptionsDelegate = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Rate limiting: 30 requests per 10 minutes per IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();
router.use(cors(corsOptions));
router.use(limiter);

router.post('/vision', async (req: Request, res: Response) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }
  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    // Do not log imageBase64 or apiKey
    const visionRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [
              { type: 'FACE_DETECTION' },
              { type: 'LABEL_DETECTION' },
              { type: 'IMAGE_PROPERTIES' },
            ],
          },
        ],
      }),
    });
    const visionData = await visionRes.json();
    res.json(visionData);
  } catch (err) {
    res.status(500).json({ error: 'Vision API error' });
  }
});

// --- BrandKit Section Regeneration Route ---
router.post('/brandkit/section', async (req: Request, res: Response) => {
  const { name, ageRange, skinTone, vibeKeywords, expression, section } = req.body;
  if (!name || !vibeKeywords || !section) {
    return res.status(400).json({ error: 'Missing required fields: name, vibeKeywords, section' });
  }
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing OpenRouter API key' });
    // Section-specific prompt
    const prompt = `You are a world-class brand strategist AI. Given the following user details, generate ONLY the '${section}' field for their personal brand kit.\n\nUser Details: ${JSON.stringify({ name, ageRange, skinTone, vibeKeywords, expression })}\n\nOutput a single valid JSON object: { \"${section}\": ... } (no markdown, no explanation, no extra text).`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: 'OpenRouter API error', details: errorText });
    }
    const data = await response.json();
    let sectionResult = {};
    try {
      sectionResult = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse LLM response as JSON.' });
    }
    res.json(sectionResult);
  } catch (err) {
    res.status(500).json({ error: 'Section regeneration error' });
  }
});

export default router; 