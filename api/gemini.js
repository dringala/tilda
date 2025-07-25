import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are supported.' });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  let prompt;
  try {
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }
    prompt = req.body?.prompt;
  } catch (e) {
    console.error('[Debug] Failed to parse request body:', e);
    return res.status(400).json({ error: 'Invalid JSON body provided.' });
  }

  console.log('[Debug] Received prompt:', prompt);
  console.log('[Debug] API key loaded:', !!apiKey);

  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body or API key in env.' });
  }

  try {
    const { text } = await generateText({
      model: google('models/gemini-1.5-flash', { apiKey }),
      prompt,
    });

    res.status(200).json({ text });
  } catch (err) {
    console.error('Error during Gemini text generation:', err);
    res.status(500).json({ error: err.message || 'Gemini request failed' });
  }
}
