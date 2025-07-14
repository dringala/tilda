import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  if (!key || !prompt) {
    return res.status(400).json({ error: 'Missing prompt or API key' });
  }

  try {
    const model = google('models/gemini-2.0-flash', {
      apiKey: key,
    });

    const result = await generateText({
      model,
      prompt,
    });

    res.status(200).json({ text: result.text });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Gemini request failed' });
  }
}
