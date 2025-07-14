import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  let prompt;
  try {
    // Ensure JSON is parsed correctly
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }
    prompt = req.body?.prompt;
  } catch (e) {
    console.error('[Debug] Failed to parse body:', e);
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Debug logs
  console.log('[Debug] prompt:', prompt);
  console.log('[Debug] apiKey exists:', !!apiKey);

  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'Missing prompt or API key' });
  }

  try {
    const { text } = await generateText({
      model: google('models/gemini-1.5-flash', { apiKey }),
      prompt,
    });

    res.status(200).json({ text });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Gemini request failed' });
  }
}
