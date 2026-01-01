
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Chat routes
app.post('/chat', async (req, res) => {
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

  const { message } = req.body;
  const text = message.toLowerCase();

  for (const f of FAQS) {
    if (f.q.some(k => text.includes(k))) {
      return res.json({ found: true, answer: f.a });
    }
  }

  res.json({ found: false });
});

app.post('/chat/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({
    where: { email }
  });

const valid = await bcrypt.compare(password, admin.password)
if (!admin || !valid) {
  return res.status(401).json({ error: "Invalid" })
}

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET
  );

res.cookie("auth_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000
})

return res.json({ success: true })

  
});

app.post('/chat/auth', (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) return res.json({ ok: true });

  res.status(401).json({ error: "Unauthorized" });
});

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
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(projects);
});

app.post('/chat/projects', async (req, res) => {
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
});

app.delete('/chat/projects/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.project.delete({
    where: { id: parseInt(id) }
  });
  res.json({ success: true });
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