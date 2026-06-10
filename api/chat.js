export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages, system } = req.body;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
        },
        body: JSON.stringify({
          system_prompt: system,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      }
    );

    const data = await response.json();
    console.log('CF response:', JSON.stringify(data));
    const reply = data?.result?.response || "No response from AI.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ reply: "Something went wrong on the server." });
  }
}
