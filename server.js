
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();


const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("./cloudinary")

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "carconnect",
    resource_type: file.mimetype.startsWith("video")
      ? "video"
      : "image"
  })
})

const upload = multer({ storage })






const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists

// Middleware
app.use(
  cors({
    origin: [
      "https://carconnectltd.netlify.app",
      "http://localhost:3000"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


// Routes

function findFAQAnswer(message) {
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
  ];

  const text = String(message || '').toLowerCase();
  for (const faq of FAQS) {
    if (faq.q.some(k => text.includes(k))) {
      return faq.a;
    }
  }
  return null;
}

// Chat routes
app.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  console.log('Incoming:', message);

  // 🔹 FAQ CHECK
  const faqAnswer = findFAQAnswer(message);

  if (faqAnswer) {
    return res.json({ reply: faqAnswer });
  }

  // 🔹 AI CALL (Groq)
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY missing");
    return res.json({ reply: "Server configuration error." });
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `
You are CarConnect Assistant.

Rules:
- Be friendly and natural
- Answer general questions like a human (e.g. greetings, small talk)
- Focus on CarConnect when relevant
- Do NOT always return the welcome message
`
        },
        ...history,
        { role: 'user', content: message }
      ]
    })
  });

  const data = await response.json();

  console.log("FULL GROQ RESPONSE:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error('Groq API error:', data);
    return res.json({ reply: 'I\'m having trouble connecting to AI right now.' });
  }

  const reply = data?.choices?.[0]?.message?.content;

  if (!reply) {
    return res.json({ reply: 'I\'m having trouble connecting to AI right now.' });
  }

  return res.json({ reply });
});

app.post('/chat/login', async (req, res) => {
  const { email, password } = req.body

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin || admin.password !== password) {
    return res.status(401).json({ error: "Invalid" })
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  res.json({ token }) // ✅ SEND TOKEN
})


app.get("/chat/auth-check", (req, res) => {
  try {
    const auth = req.headers.authorization
    if (!auth) return res.json({ authenticated: false })

    const token = auth.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET)

    res.json({ authenticated: true })
  } catch {
    res.json({ authenticated: false })
  }
})

app.post('/chat/ask-email', async (req, res) => {
  const { email, question } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    to: "carconnectltd.rw@gmail.com",
    subject: "Chatbot Question",
    text: `From: ${email}\n\n${question}`
  });

  res.json({ ok: true });
});

// Projects
app.get('/chat/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/chat/projects', async (req, res) => {
  try {
    const body = req.body;

    const project = await prisma.project.create({
      data: {
        title: body.title,
        status: body.type,
        poster: body.mediaUrl,
        video: body.videoUrl
      },
    });

    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.delete('/chat/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Apps
app.get('/chat/apps', async (req, res) => {
  const apps = await prisma.app.findMany();
  res.json(apps);
});

app.post('/chat/apps', async (req, res) => {
  const body = req.body;
  const app = await prisma.app.create({
    data: body
  });
  res.json(app);
});

app.delete('/chat/apps/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.app.delete({
    where: { id: parseInt(id) }
  });
  res.json({ success: true });
});

// Contact
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: "carconnectltd.rw@gmail.com",
      subject: `Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Contact Form Message</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">This message was sent from the CarConnect Ltd website contact form.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send message. Please try again." });
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false })
    }

    res.json({
      url: req.file.path // ✅ Cloudinary URL
    })

  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ success: false })
  }
})


// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  })

  res.json({ success: true })
})

app.get("/chat/auth-check", (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.json({ authenticated: false });

    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ authenticated: true });

  } catch {
    res.json({ authenticated: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});