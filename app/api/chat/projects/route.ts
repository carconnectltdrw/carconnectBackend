import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET — list all projects
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(projects)
}

// POST — create project
export async function POST(req: Request) {
  const body = await req.json()

  const project = await prisma.Project.create({
    data: {
      title: body.title,
      status: body.type,
      poster: body.mediaUrl,
      video: body.videoUrl
    },
  })

  return NextResponse.json(project)
}
