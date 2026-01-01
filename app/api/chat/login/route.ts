import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const admin = await prisma.admin.findUnique({
    where: { email }
  })

  if (!admin || admin.password !== password) {
    return NextResponse.json({ error: "Invalid" }, { status: 401 })
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET!
  )

  const res = NextResponse.json({ success: true })

  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return res
}
