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
// GOOGLE_CLOUD_VISION_API_KEY=AIzaSyDOrlaAns5-IXmPK3Y7ium2kA8CxP25ZBo

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

export default router; 