// Import necessary functions from the AI SDK
import { generateText } from 'ai';
// Import the Google provider from the AI SDK
import { google } from '@ai-sdk/google';

/**
 * This is the main API handler function for your Vercel API route.
 * It handles incoming requests to the /api/generate-text endpoint.
 *
 * @param {object} req The incoming request object.
 * @param {object} res The outgoing response object.
 */
export default async function handler(req, res) {
  // Ensure that the request method is POST.
  // This API is designed to receive data (the prompt) via a POST request.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are supported.' });
  }

  // Retrieve the Gemini API key from environment variables.
  // It's crucial to store sensitive information like API keys in environment variables
  // and not hardcode them directly in your application code.
  const apiKey = process.env.GEMINI_API_KEY;

  let prompt;
  try {
    // Attempt to parse the request body if it's a string.
    // This can be useful if the client sends a raw JSON string
    // without explicitly setting the 'Content-Type' header to 'application/json',
    // or if the framework doesn't automatically parse it.
    // However, for most modern frameworks (like Next.js/Vercel),
    // if 'Content-Type: application/json' is sent, req.body will already be parsed.
    if (typeof req.body === 'string') {
      req.body = JSON.parse(req.body);
    }
    // Extract the 'prompt' field from the parsed request body.
    prompt = req.body?.prompt;
  } catch (e) {
    // Log any errors encountered during body parsing for debugging purposes.
    console.error('[Debug] Failed to parse request body:', e);
    // Send a 400 Bad Request response if the JSON body is invalid.
    return res.status(400).json({ error: 'Invalid JSON body provided.' });
  }

  // Debugging logs to see the prompt and whether the API key is loaded.
  console.log('[Debug] Received prompt:', prompt);
  console.log('[Debug] API key loaded:', !!apiKey);

  // Validate that both the API key and the prompt are present.
  // If either is missing, return a 400 Bad Request error.
  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body or GEMINI_API_KEY environment variable.' });
  }

  try {
    // Call the generateText function from the AI SDK.
    // This function interacts with the specified AI model to generate text.
    const { text } = await generateText({
      // Configure the model to use Google's Gemini-1.5-Flash.
      // For your current AI SDK versions, the API key is passed directly here.
      model: google({
        model: 'gemini-1.5-flash', // Specify the exact model to use
        apiKey, // Pass the retrieved API key directly
      }),
      // Provide the user's prompt to the model for text generation.
      prompt,
    });

    // If text generation is successful, send the generated text back as a JSON response
    // with a 200 OK status.
    res.status(200).json({ text });
  } catch (err) {
    // Catch any errors that occur during the AI text generation process.
    // Log the error for debugging.
    console.error('Error during Gemini text generation:', err);
    // Send a 500 Internal Server Error response to the client.
    res.status(500).json({ error: 'Failed to generate text from Gemini. Please try again later.' });
  }
}
