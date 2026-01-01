import nodemailer from "nodemailer"

export async function POST(req:Request){
  const { email, question } = await req.json()

  const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:process.env.MAIL_USER,
      pass:process.env.MAIL_PASS
    }
  })

  await transporter.sendMail({
    to:"carconnectltd.rw@gmail.com",
    subject:"Chatbot Question",
    text:`From: ${email}\n\n${question}`
  })

  return Response.json({ ok:true })
}
