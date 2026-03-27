import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy init — ES module imports are hoisted before dotenv.config() runs,
// so we must NOT instantiate at module load time.
let _genAI = null;
const getGenAI = () => {
  if (!_genAI) _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return _genAI;
};

// @desc    Analyse a food image and return name + type
// @route   POST /api/ai/analyze-food
// @access  Private
export const analyzeFood = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Strip data URL prefix if present (e.g. "data:image/jpeg;base64,...")
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const mimeType = imageBase64.includes('data:')
      ? imageBase64.split(';')[0].split(':')[1]
      : 'image/jpeg';

    const model = getGenAI().getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are a food recognition assistant for the FoodLink platform. Analyze this food image and respond ONLY with a valid JSON object (no markdown, no code fences) in exactly this format:
{
  "name": "<short descriptive food name, e.g. Vegetable Biryani>",
  "type": "<either 'veg' or 'non-veg'>",
  "description": "<one sentence describing the food>",
  "expiryHours": <number: estimated hours until this food should be consumed or composted>
}
Be concise. For 'expiryHours', estimate based on the food type:
- Fresh cooked meals: 4-6 hours
- Bakery items: 24-48 hours
- Raw fruits/vegetables: 72+ hours
If you cannot identify the food clearly, make your best guess for all fields.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const text = result.response.text().trim();

    // Parse JSON safely
    let parsed;
    try {
      // Remove any accidental markdown code fences
      const cleaned = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: try to extract JSON from the response
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ message: 'Could not parse AI response', raw: text });
      }
    }

    // Normalise type
    if (parsed.type && !['veg', 'non-veg'].includes(parsed.type)) {
      parsed.type = parsed.type.toLowerCase().includes('non') ? 'non-veg' : 'veg';
    }

    res.json(parsed);
  } catch (error) {
    console.error('[analyzeFood] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with Gemini about FoodLink
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const model = getGenAI().getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: `You are FoodLink AI, a friendly and knowledgeable assistant for the FoodLink platform — a community-driven food redistribution network that connects food donors with receivers, farmers (for compost), and volunteers (for deliveries).

Here's how FoodLink works:
- **Donors** post surplus food listings with location and expiry time.
- **Receivers** browse available food on a map, claim items, and wait for donor approval.
- **Volunteers** pick up accepted food from donors and deliver it to receivers.
- **Farmers** claim expired/compostable food for composting.
- Food goes through these statuses: Available → Pending (claimed) → Accepted (donor approved) → Picked → Delivered → Completed.

Keep answers concise, helpful, and friendly. If asked something outside FoodLink, gently redirect back. Do not use markdown headers in responses, keep it conversational.`,
    });

    // Build chat history in Gemini format
    // Gemini requires history to start with a 'user' role — drop any leading model messages
    const formattedHistory = history
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))
      .filter((_, idx, arr) => {
        // Drop messages from the start until we hit the first 'user' message
        const firstUserIdx = arr.findIndex((m) => m.role === 'user');
        return idx >= firstUserIdx;
      });

    const chatSession = model.startChat({ history: formattedHistory });
    const result = await chatSession.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error('[chat] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
