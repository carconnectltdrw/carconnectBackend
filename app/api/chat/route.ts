const FAQS = [
  {
    q: ["hi","hello","hey","salute","greetings"],
    a: "Hello! 👋 Welcome to CarConnect Ltd. How can we help?"
  },
  {
    q: ["what is carconnect","who are you"],
    a: "CarConnect Ltd is a smart mobility & logistics technology company in Rwanda."
  },
  {
    q: ["services","what do you do","solutions"],
    a: "We provide smart transport, fleet & logistics tech solutions."
  },
  {
    q: ["contact","email","support"],
    a: "Please email carconnectltd.rw@gmail.com or WhatsApp +250780114522."
  },
  {
    q: ["app","mobile app","when is app ready"],
    a: "Our mobile app is coming soon 🚀 stay tuned!"
  }
]

export async function POST(req: Request) {
  const { message } = await req.json()
  const text = message.toLowerCase()

  for (const f of FAQS) {
    if (f.q.some(k => text.includes(k))) {
      return Response.json({ found:true, answer:f.a })
    }
  }

  return Response.json({ found:false })
}
