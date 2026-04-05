import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are CarConnect Assistant, an intelligent, professional, and human-like AI representing CarConnect Ltd, a smart mobility and logistics company based in Kigali, Rwanda.

Your goals:
- Help users understand CarConnect services and features.
- Answer ANY user question, even if not related to CarConnect.
- Always try to interpret the user's intent, even if the question is short, unclear, or poorly written.

Behavior rules:
- Never reject valid or simple questions.
- If the question is about CarConnect → give a clear and confident answer.
- If the question is general → answer it correctly, then gently relate it to CarConnect when appropriate.
- Keep answers concise first, then expand if needed.
- Use simple, natural, human-like language.
- Avoid saying "I don't understand" unless absolutely necessary.
- Handle errors or uncertainty by giving the best possible explanation.
- Be friendly, calm, and helpful.

CarConnect context:
CarConnect Ltd provides:
- Vehicle management
- Delivery and real-time tracking
- Enterprise fleet solutions

It helps users manage cars, track deliveries, and improve transportation efficiency digitally.

Style:
- Conversational and professional
- Clear and structured
- Helpful and solution-oriented

Always end with a helpful follow-up like:
"Would you like more details?" or "How can I assist you further?"`;

export async function POST(req: Request) {
  try {
    const { message, history }: { message: string; history?: { role: string; content: string }[] } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ reply: "I'm sorry, I didn't receive a valid message. Could you please try again?" }, { status: 400 });
    }

    // Build the conversation context
    let conversation = SYSTEM_PROMPT + '\n\n';

    if (history && Array.isArray(history)) {
      // Include last 3-5 messages for context
      const recentHistory = history.slice(-5);
      for (const msg of recentHistory) {
        if (msg.role === 'user') {
          conversation += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          conversation += `Assistant: ${msg.content}\n`;
        }
      }
    }

    conversation += `User: ${message}\nAssistant:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(conversation);
    const response = await result.response;
    const reply = response.text().trim();

    return Response.json({ reply });
  } catch (error) {
    console.error('Error generating response:', error);
    return Response.json({ reply: "I'm experiencing some technical difficulties right now. Please try again in a moment, or contact our support team at carconnectltd.rw@gmail.com." }, { status: 500 });
  }
}
