export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages, system } = req.body;

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents
        })
      }
    );

    const data = await response.json();
    
    // Log full response to debug
    console.log('Gemini response:', JSON.stringify(data));

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ reply: "Something went wrong on the server." });
  }
}
