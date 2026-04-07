import { NextResponse } from 'next/server';

// FAQs
const faqs = {
  "what is carconnect": "CarConnect Ltd is a company based in Rwanda that builds secure, trusted platforms for transportation and logistics, bridging technology and traditional mobility.",
  "what does carconnect do": "CarConnect provides vehicle management, delivery and real-time tracking, and enterprise fleet solutions to improve transportation efficiency digitally.",
  "how to contact carconnect": "You can contact us via email at carconnectltd.rw@gmail.com, call +250 780 114 522, or visit us in Kicukiro, Kigali – Rwanda.",
  "what services does carconnect offer": "We offer mobility apps, package delivery with tracking, and enterprise fleet management solutions.",
  "where is carconnect located": "CarConnect is located in Kicukiro, Kigali – Rwanda.",
};

// Function to detect FAQ
function detectFAQ(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(faqs)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { message, history = [], userName }: { message: string; history?: { role: string; content: string }[]; userName?: string } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: 'Invalid message provided.' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing');
      return NextResponse.json({ reply: 'Server configuration error.' }, { status: 500 });
    }

    const faqAnswer = detectFAQ(message);

    console.log("FAQ:", faqAnswer);
    console.log("Message:", message);

    let reply = "";

    if (faqAnswer && message.length < 40) {
      reply = faqAnswer;
    } else {
      const messages = [
        {
          role: 'system',
          content: `You are CarConnect Assistant, a friendly AI assistant focused on CarConnect-related services. You provide helpful, accurate responses about CarConnect's smart mobility and logistics solutions. If a question is unrelated, respond helpfully anyway. Never return empty responses.`
        },
        ...history.slice(-10),
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: messages
        })
      });

      if (!response.ok) {
        console.error('Groq API error:', response.status, response.statusText);
        return NextResponse.json({ reply: 'I\'m not sure how to respond to that right now.' }, { status: 500 });
      }

      const data = await response.json();

      console.log('Groq response:', data);

      reply = data?.choices?.[0]?.message?.content || 'I\'m not sure how to respond to that right now.';

      if (!reply.trim()) {
        reply = 'I\'m not sure how to respond to that right now.';
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ reply: 'Server error. Please try again.' }, { status: 500 });
  }
}
