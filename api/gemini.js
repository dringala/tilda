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
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': key
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Gemini response:', data);
      return res.status(200).json({ text: 'No valid response' });
    }

    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Something went wrong with Gemini' });
  }
}
