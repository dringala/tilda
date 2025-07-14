import { GoogleGenerativeAI } from 'ai/google';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  const { prompt } = req.body;

  if (!key || !prompt) {
    return res.status(400).json({ error: 'Missing prompt or API key' });
  }

  const google = new GoogleGenerativeAI({
    apiKey: key,
    model: 'models/gemini-1.5-flash',
  });

  try {
    const result = await google.invoke(prompt);
    res.status(200).json({ text: result });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Gemini request failed' });
  }
}
